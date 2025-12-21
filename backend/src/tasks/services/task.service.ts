import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  TaskRepository,
  TaskWithRelations,
  TaskFilterOptions,
} from '../repositories/task.repository';
import { CreateTaskDto, UpdateTaskDto, TaskFilterDto } from '../dto/task.dto';
import { NotificationService } from '../../notifications/services/notification.service';
import { EventsGateway } from '../../events/events.gateway';

/**
 * Task Service - Business logic for task management
 */
@Injectable()
export class TaskService {
  constructor(
    private readonly taskRepository: TaskRepository,
    private readonly notificationService: NotificationService,
    private readonly eventsGateway: EventsGateway,
  ) {}

  /**
   * Create a new task
   */
  async create(
    dto: CreateTaskDto,
    creatorId: string,
  ): Promise<TaskWithRelations> {
    const task = await this.taskRepository.create({
      title: dto.title,
      description: dto.description,
      status: dto.status,
      priority: dto.priority,
      dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
      creatorId,
      assigneeId: dto.assigneeId,
    });

    // Emit real-time event
    this.eventsGateway.emitTaskCreated(task);

    // Create notification if task is assigned
    if (dto.assigneeId && dto.assigneeId !== creatorId) {
      await this.notificationService.createTaskAssignedNotification(
        dto.assigneeId,
        task.id,
        task.title,
      );
    }

    return task;
  }

  /**
   * Get all tasks for user with filters
   */
  async findAll(
    userId: string,
    filters: TaskFilterDto,
  ): Promise<TaskWithRelations[]> {
    const options: TaskFilterOptions = {
      userId,
      ...(filters.status && { status: filters.status }),
      ...(filters.priority && { priority: filters.priority }),
      ...(filters.sortBy && { sortBy: filters.sortBy }),
      ...(filters.sortOrder && { sortOrder: filters.sortOrder }),
      ...(filters.view && { view: filters.view }),
    };

    return this.taskRepository.findAll(options);
  }

  /**
   * Get a single task by ID
   */
  async findOne(id: string, userId: string): Promise<TaskWithRelations> {
    const task = await this.taskRepository.findById(id);

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // Check if user has access to this task
    if (task.creatorId !== userId && task.assigneeId !== userId) {
      throw new ForbiddenException('You do not have access to this task');
    }

    return task;
  }

  /**
   * Update a task
   */
  async update(
    id: string,
    dto: UpdateTaskDto,
    userId: string,
  ): Promise<TaskWithRelations> {
    const existingTask = await this.taskRepository.findById(id);

    if (!existingTask) {
      throw new NotFoundException('Task not found');
    }

    // Only creator can update the task
    if (existingTask.creatorId !== userId) {
      throw new ForbiddenException(
        'Only the task creator can update this task',
      );
    }

    const previousAssigneeId = existingTask.assigneeId;

    const updateData: Prisma.TaskUpdateInput = {};

    if (dto.title !== undefined) {
      updateData.title = dto.title;
    }
    if (dto.description !== undefined) {
      updateData.description = { set: dto.description };
    }
    if (dto.status !== undefined) {
      updateData.status = dto.status;
    }
    if (dto.priority !== undefined) {
      updateData.priority = dto.priority;
    }
    if (dto.dueDate !== undefined) {
      updateData.dueDate = dto.dueDate ? new Date(dto.dueDate) : null;
    }
    if (dto.assigneeId !== undefined) {
      updateData.assignee = dto.assigneeId
        ? { connect: { id: dto.assigneeId } }
        : { disconnect: true };
    }

    const updatedTask = await this.taskRepository.update(id, updateData);

    // Emit real-time event
    this.eventsGateway.emitTaskUpdated(updatedTask);

    // Check if assignee changed and notify new assignee
    if (
      dto.assigneeId &&
      dto.assigneeId !== previousAssigneeId &&
      dto.assigneeId !== userId
    ) {
      await this.notificationService.createTaskAssignedNotification(
        dto.assigneeId,
        updatedTask.id,
        updatedTask.title,
      );
    }

    return updatedTask;
  }

  /**
   * Delete a task
   */
  async delete(id: string, userId: string): Promise<void> {
    const task = await this.taskRepository.findById(id);

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // Only creator can delete the task
    if (task.creatorId !== userId) {
      throw new ForbiddenException(
        'Only the task creator can delete this task',
      );
    }

    await this.taskRepository.delete(id);

    // Emit real-time event
    this.eventsGateway.emitTaskDeleted(id);

    // Notify assignee if task had one
    if (task.assigneeId && task.assigneeId !== userId) {
      await this.notificationService.createTaskDeletedNotification(
        task.assigneeId,
        task.title,
      );
    }
  }

  /**
   * Get dashboard statistics
   */
  async getDashboardStats(userId: string) {
    return this.taskRepository.getDashboardStats(userId);
  }
}
