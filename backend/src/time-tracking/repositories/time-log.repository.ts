import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TimeLog, Prisma } from '@prisma/client';

/**
 * Time log with relations
 */
export type TimeLogWithRelations = TimeLog & {
  task: { id: string; title: string };
  user: { id: string; name: string; email: string; avatar: string | null };
};

/**
 * Time Log Repository - Data access layer for TimeLog entity
 */
@Injectable()
export class TimeLogRepository {
  constructor(private readonly prisma: PrismaService) {}

  private readonly includeRelations = {
    task: {
      select: { id: true, title: true },
    },
    user: {
      select: { id: true, name: true, email: true, avatar: true },
    },
  };

  /**
   * Create a time log
   */
  async create(data: {
    taskId: string;
    userId: string;
    description?: string;
    startTime: Date;
    endTime?: Date;
    duration?: number;
    isRunning?: boolean;
  }): Promise<TimeLogWithRelations> {
    return this.prisma.timeLog.create({
      data: {
        taskId: data.taskId,
        userId: data.userId,
        description: data.description || null,
        startTime: data.startTime,
        endTime: data.endTime || null,
        duration: data.duration || null,
        isRunning: data.isRunning ?? false,
      },
      include: this.includeRelations,
    });
  }

  /**
   * Find time log by ID
   */
  async findById(id: string): Promise<TimeLogWithRelations | null> {
    return this.prisma.timeLog.findUnique({
      where: { id },
      include: this.includeRelations,
    });
  }

  /**
   * Find running timer for user
   */
  async findRunningTimer(userId: string): Promise<TimeLogWithRelations | null> {
    return this.prisma.timeLog.findFirst({
      where: {
        userId,
        isRunning: true,
      },
      include: this.includeRelations,
    });
  }

  /**
   * Find all time logs for a task
   */
  async findAllForTask(taskId: string): Promise<TimeLogWithRelations[]> {
    return this.prisma.timeLog.findMany({
      where: { taskId },
      include: this.includeRelations,
      orderBy: { startTime: 'desc' },
    });
  }

  /**
   * Find all time logs for a user
   */
  async findAllForUser(
    userId: string,
    filters?: {
      startDate?: Date;
      endDate?: Date;
      taskId?: string;
    },
  ): Promise<TimeLogWithRelations[]> {
    return this.prisma.timeLog.findMany({
      where: {
        userId,
        ...(filters?.taskId && { taskId: filters.taskId }),
        ...(filters?.startDate && {
          startTime: { gte: filters.startDate },
        }),
        ...(filters?.endDate && {
          startTime: { lte: filters.endDate },
        }),
      },
      include: this.includeRelations,
      orderBy: { startTime: 'desc' },
    });
  }

  /**
   * Update a time log
   */
  async update(
    id: string,
    data: Prisma.TimeLogUpdateInput,
  ): Promise<TimeLogWithRelations> {
    return this.prisma.timeLog.update({
      where: { id },
      data,
      include: this.includeRelations,
    });
  }

  /**
   * Delete a time log
   */
  async delete(id: string): Promise<TimeLog> {
    return this.prisma.timeLog.delete({
      where: { id },
    });
  }

  /**
   * Get total time for a task
   */
  async getTotalTimeForTask(taskId: string): Promise<number> {
    const result = await this.prisma.timeLog.aggregate({
      where: { taskId },
      _sum: { duration: true },
    });
    return result._sum.duration || 0;
  }

  /**
   * Get daily time report for user
   */
  async getDailyReport(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<{ date: string; totalMinutes: number }[]> {
    const logs = await this.prisma.timeLog.findMany({
      where: {
        userId,
        startTime: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        startTime: true,
        duration: true,
      },
    });

    // Group by date
    const dailyTotals = new Map<string, number>();
    for (const log of logs) {
      const dateKey = log.startTime.toISOString().split('T')[0] ?? '';
      const current = dailyTotals.get(dateKey) ?? 0;
      dailyTotals.set(dateKey, current + (log.duration ?? 0));
    }

    return Array.from(dailyTotals.entries())
      .map(([date, totalMinutes]) => ({ date, totalMinutes }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  /**
   * Get weekly time report for user
   */
  async getWeeklyReport(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<{ week: string; totalMinutes: number }[]> {
    const logs = await this.prisma.timeLog.findMany({
      where: {
        userId,
        startTime: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        startTime: true,
        duration: true,
      },
    });

    // Group by week
    const weeklyTotals = new Map<string, number>();
    for (const log of logs) {
      const date = log.startTime;
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const weekKey = weekStart.toISOString().split('T')[0] ?? '';
      const current = weeklyTotals.get(weekKey) ?? 0;
      weeklyTotals.set(weekKey, current + (log.duration ?? 0));
    }

    return Array.from(weeklyTotals.entries())
      .map(([week, totalMinutes]) => ({ week, totalMinutes }))
      .sort((a, b) => a.week.localeCompare(b.week));
  }

  /**
   * Get productivity stats
   */
  async getProductivityStats(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<{
    totalTimeSpent: number;
    tasksWorkedOn: number;
    averageTimePerTask: number;
    mostProductiveDay: string | null;
    taskBreakdown: {
      taskId: string;
      taskTitle: string;
      totalMinutes: number;
    }[];
  }> {
    const logs = await this.prisma.timeLog.findMany({
      where: {
        userId,
        startTime: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        task: {
          select: { id: true, title: true },
        },
      },
    });

    // Calculate stats
    const totalTimeSpent = logs.reduce(
      (sum, log) => sum + (log.duration || 0),
      0,
    );
    const taskIds = new Set(logs.map((log) => log.taskId));
    const tasksWorkedOn = taskIds.size;
    const averageTimePerTask =
      tasksWorkedOn > 0 ? totalTimeSpent / tasksWorkedOn : 0;

    // Find most productive day
    const dailyTotals = new Map<string, number>();
    for (const log of logs) {
      const dateKey = log.startTime.toISOString().split('T')[0] ?? '';
      const current = dailyTotals.get(dateKey) ?? 0;
      dailyTotals.set(dateKey, current + (log.duration ?? 0));
    }

    let mostProductiveDay: string | null = null;
    let maxMinutes = 0;
    for (const [date, minutes] of dailyTotals) {
      if (minutes > maxMinutes) {
        maxMinutes = minutes;
        mostProductiveDay = date;
      }
    }

    // Task breakdown
    const taskTotals = new Map<
      string,
      { taskTitle: string; totalMinutes: number }
    >();
    for (const log of logs) {
      const current = taskTotals.get(log.taskId);
      if (current) {
        current.totalMinutes += log.duration || 0;
      } else {
        taskTotals.set(log.taskId, {
          taskTitle: log.task.title,
          totalMinutes: log.duration || 0,
        });
      }
    }

    const taskBreakdown = Array.from(taskTotals.entries())
      .map(([taskId, data]) => ({
        taskId,
        ...data,
      }))
      .sort((a, b) => b.totalMinutes - a.totalMinutes);

    return {
      totalTimeSpent,
      tasksWorkedOn,
      averageTimePerTask,
      mostProductiveDay,
      taskBreakdown,
    };
  }
}
