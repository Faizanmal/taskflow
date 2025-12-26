import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  TimeLogRepository,
  TimeLogWithRelations,
} from '../repositories/time-log.repository';
import {
  CreateTimeLogDto,
  UpdateTimeLogDto,
  StartTimerDto,
  TimeReportFilterDto,
} from '../dto/time-log.dto';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * Time Tracking Service - Business logic for time tracking
 */
@Injectable()
export class TimeTrackingService {
  constructor(
    private readonly timeLogRepository: TimeLogRepository,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Start a timer for a task
   */
  async startTimer(
    taskId: string,
    dto: StartTimerDto,
    userId: string,
  ): Promise<TimeLogWithRelations> {
    // Check if user already has a running timer
    const runningTimer = await this.timeLogRepository.findRunningTimer(userId);
    if (runningTimer) {
      throw new BadRequestException(
        'You already have a running timer. Stop it before starting a new one.',
      );
    }

    // Verify task exists
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      select: { id: true },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return this.timeLogRepository.create({
      taskId,
      userId,
      startTime: new Date(),
      isRunning: true,
      ...(dto.description && { description: dto.description }),
    });
  }

  /**
   * Stop the running timer
   */
  async stopTimer(userId: string): Promise<TimeLogWithRelations> {
    const runningTimer = await this.timeLogRepository.findRunningTimer(userId);

    if (!runningTimer) {
      throw new NotFoundException('No running timer found');
    }

    const endTime = new Date();
    const duration = Math.round(
      (endTime.getTime() - runningTimer.startTime.getTime()) / 60000,
    ); // Convert to minutes

    return this.timeLogRepository.update(runningTimer.id, {
      endTime,
      duration,
      isRunning: false,
    });
  }

  /**
   * Get running timer for user
   */
  async getRunningTimer(userId: string): Promise<TimeLogWithRelations | null> {
    return this.timeLogRepository.findRunningTimer(userId);
  }

  /**
   * Create a manual time log
   */
  async createManualLog(
    taskId: string,
    dto: CreateTimeLogDto,
    userId: string,
  ): Promise<TimeLogWithRelations> {
    // Verify task exists
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      select: { id: true },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    const startTime = new Date(dto.startTime);
    let endTime: Date | undefined;
    let duration: number | undefined;

    if (dto.endTime) {
      endTime = new Date(dto.endTime);
      duration = Math.round((endTime.getTime() - startTime.getTime()) / 60000);
    } else if (dto.duration) {
      duration = dto.duration;
      endTime = new Date(startTime.getTime() + duration * 60000);
    }

    return this.timeLogRepository.create({
      taskId,
      userId,
      startTime,
      isRunning: false,
      ...(dto.description && { description: dto.description }),
      ...(endTime && { endTime }),
      ...(duration !== undefined && { duration }),
    });
  }

  /**
   * Update a time log
   */
  async update(
    id: string,
    dto: UpdateTimeLogDto,
    userId: string,
  ): Promise<TimeLogWithRelations> {
    const timeLog = await this.timeLogRepository.findById(id);

    if (!timeLog) {
      throw new NotFoundException('Time log not found');
    }

    if (timeLog.userId !== userId) {
      throw new ForbiddenException('You can only edit your own time logs');
    }

    const updateData: Prisma.TimeLogUpdateInput = {};

    if (dto.description !== undefined) {
      updateData.description = dto.description;
    }

    if (dto.startTime) {
      updateData.startTime = new Date(dto.startTime);
    }

    if (dto.endTime) {
      updateData.endTime = new Date(dto.endTime);
    }

    if (dto.duration !== undefined) {
      updateData.duration = dto.duration;
    }

    if (dto.isRunning !== undefined) {
      updateData.isRunning = dto.isRunning;
    }

    // Recalculate duration if start/end times changed
    if (dto.startTime || dto.endTime) {
      const startTime = dto.startTime
        ? new Date(dto.startTime)
        : timeLog.startTime;
      const endTime = dto.endTime ? new Date(dto.endTime) : timeLog.endTime;

      if (startTime && endTime) {
        updateData.duration = Math.round(
          (endTime.getTime() - startTime.getTime()) / 60000,
        );
      }
    }

    return this.timeLogRepository.update(id, updateData);
  }

  /**
   * Delete a time log
   */
  async delete(id: string, userId: string): Promise<void> {
    const timeLog = await this.timeLogRepository.findById(id);

    if (!timeLog) {
      throw new NotFoundException('Time log not found');
    }

    if (timeLog.userId !== userId) {
      throw new ForbiddenException('You can only delete your own time logs');
    }

    await this.timeLogRepository.delete(id);
  }

  /**
   * Get all time logs for a task
   */
  async getTaskTimeLogs(taskId: string): Promise<TimeLogWithRelations[]> {
    return this.timeLogRepository.findAllForTask(taskId);
  }

  /**
   * Get total time for a task
   */
  async getTaskTotalTime(taskId: string): Promise<number> {
    return this.timeLogRepository.getTotalTimeForTask(taskId);
  }

  /**
   * Get user's time logs with filters
   */
  async getUserTimeLogs(
    userId: string,
    filters: TimeReportFilterDto,
  ): Promise<TimeLogWithRelations[]> {
    const queryFilters: { startDate?: Date; endDate?: Date; taskId?: string } =
      {};
    if (filters.startDate) queryFilters.startDate = new Date(filters.startDate);
    if (filters.endDate) queryFilters.endDate = new Date(filters.endDate);
    if (filters.taskId) queryFilters.taskId = filters.taskId;

    return this.timeLogRepository.findAllForUser(userId, queryFilters);
  }

  /**
   * Get daily time report
   */
  async getDailyReport(
    userId: string,
    startDate: string,
    endDate: string,
  ): Promise<{ date: string; totalMinutes: number }[]> {
    return this.timeLogRepository.getDailyReport(
      userId,
      new Date(startDate),
      new Date(endDate),
    );
  }

  /**
   * Get weekly time report
   */
  async getWeeklyReport(
    userId: string,
    startDate: string,
    endDate: string,
  ): Promise<{ week: string; totalMinutes: number }[]> {
    return this.timeLogRepository.getWeeklyReport(
      userId,
      new Date(startDate),
      new Date(endDate),
    );
  }

  /**
   * Get productivity stats
   */
  async getProductivityStats(
    userId: string,
    startDate: string,
    endDate: string,
  ) {
    return this.timeLogRepository.getProductivityStats(
      userId,
      new Date(startDate),
      new Date(endDate),
    );
  }
}
