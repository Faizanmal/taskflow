import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import {
  TemplateRepository,
  TemplateWithRelations,
} from '../repositories/template.repository';
import {
  CreateTemplateDto,
  UpdateTemplateDto,
  CreateTaskFromTemplateDto,
  RecurringTaskSettingsDto,
} from '../dto/template.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { Task } from '@prisma/client';

/**
 * Template Service - Business logic for templates and recurring tasks
 */
@Injectable()
export class TemplateService {
  constructor(
    private readonly templateRepository: TemplateRepository,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Create a template
   */
  async create(
    dto: CreateTemplateDto,
    userId: string,
  ): Promise<TemplateWithRelations> {
    return this.templateRepository.create({
      name: dto.name,
      taskTitle: dto.taskTitle,
      creatorId: userId,
      ...(dto.description && { description: dto.description }),
      ...(dto.taskDescription && { taskDescription: dto.taskDescription }),
      ...(dto.taskPriority && { taskPriority: dto.taskPriority }),
      ...(dto.estimatedTime !== undefined && { estimatedTime: dto.estimatedTime }),
      ...(dto.isPublic !== undefined && { isPublic: dto.isPublic }),
      ...(dto.workspaceId && { workspaceId: dto.workspaceId }),
      ...(dto.subtasks && { subtaskTemplates: JSON.stringify(dto.subtasks) }),
    });
  }

  /**
   * Get templates for user
   */
  async findForUser(
    userId: string,
    workspaceId?: string,
  ): Promise<TemplateWithRelations[]> {
    return this.templateRepository.findForUser(userId, workspaceId);
  }

  /**
   * Get template by ID
   */
  async findOne(id: string, userId: string): Promise<TemplateWithRelations> {
    const template = await this.templateRepository.findById(id);

    if (!template) {
      throw new NotFoundException('Template not found');
    }

    // Check access
    if (template.creatorId !== userId && !template.isPublic) {
      throw new ForbiddenException('You do not have access to this template');
    }

    return template;
  }

  /**
   * Update a template
   */
  async update(
    id: string,
    dto: UpdateTemplateDto,
    userId: string,
  ): Promise<TemplateWithRelations> {
    const template = await this.templateRepository.findById(id);

    if (!template) {
      throw new NotFoundException('Template not found');
    }

    if (template.creatorId !== userId) {
      throw new ForbiddenException('Only the creator can update this template');
    }

    return this.templateRepository.update(id, {
      ...(dto.name && { name: dto.name }),
      ...(dto.description !== undefined && { description: dto.description }),
      ...(dto.taskTitle && { taskTitle: dto.taskTitle }),
      ...(dto.taskDescription !== undefined && {
        taskDescription: dto.taskDescription,
      }),
      ...(dto.taskPriority && { taskPriority: dto.taskPriority }),
      ...(dto.estimatedTime !== undefined && {
        estimatedTime: dto.estimatedTime,
      }),
      ...(dto.isPublic !== undefined && { isPublic: dto.isPublic }),
      ...(dto.subtasks && {
        subtaskTemplates: JSON.stringify(dto.subtasks),
      }),
    });
  }

  /**
   * Delete a template
   */
  async delete(id: string, userId: string): Promise<void> {
    const template = await this.templateRepository.findById(id);

    if (!template) {
      throw new NotFoundException('Template not found');
    }

    if (template.creatorId !== userId) {
      throw new ForbiddenException('Only the creator can delete this template');
    }

    await this.templateRepository.delete(id);
  }

  /**
   * Create task from template
   */
  async createTaskFromTemplate(
    templateId: string,
    dto: CreateTaskFromTemplateDto,
    userId: string,
  ): Promise<Task> {
    const template = await this.findOne(templateId, userId);

    // Create the main task
    const task = await this.prisma.task.create({
      data: {
        title: dto.title || template.taskTitle,
        description: template.taskDescription,
        priority: template.taskPriority,
        estimatedTime: template.estimatedTime,
        creatorId: userId,
        assigneeId: dto.assigneeId || null,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
        workspaceId: dto.workspaceId || template.workspaceId || null,
        templateId: template.id,
      },
    });

    // Create subtasks if template has them
    if (template.subtaskTemplates) {
      try {
        const subtasks = JSON.parse(template.subtaskTemplates) as {
          title: string;
          description?: string;
        }[];
        for (const subtask of subtasks) {
          await this.prisma.task.create({
            data: {
              title: subtask.title,
              description: subtask.description || null,
              priority: template.taskPriority,
              creatorId: userId,
              parentTaskId: task.id,
              workspaceId: dto.workspaceId || template.workspaceId || null,
            },
          });
        }
      } catch {
        // Ignore JSON parse errors
      }
    }

    return task;
  }

  /**
   * Set up recurring task
   */
  async setupRecurringTask(
    taskId: string,
    settings: RecurringTaskSettingsDto,
    userId: string,
  ): Promise<Task> {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    if (task.creatorId !== userId) {
      throw new ForbiddenException('Only the creator can set up recurrence');
    }

    return this.prisma.task.update({
      where: { id: taskId },
      data: {
        isRecurring: true,
        recurringPattern: settings.pattern,
        recurringInterval: settings.interval || 1,
        recurringDays: settings.days ? JSON.stringify(settings.days) : null,
        recurringEndDate: settings.endDate ? new Date(settings.endDate) : null,
      },
    });
  }

  /**
   * Remove recurring settings
   */
  async removeRecurrence(taskId: string, userId: string): Promise<Task> {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    if (task.creatorId !== userId) {
      throw new ForbiddenException('Only the creator can modify recurrence');
    }

    return this.prisma.task.update({
      where: { id: taskId },
      data: {
        isRecurring: false,
        recurringPattern: null,
        recurringInterval: null,
        recurringDays: null,
        recurringEndDate: null,
      },
    });
  }

  /**
   * Process recurring tasks (called by scheduler)
   */
  async processRecurringTasks(): Promise<number> {
    const now = new Date();
    let createdCount = 0;

    // Find all recurring tasks that need to be processed
    const recurringTasks = await this.prisma.task.findMany({
      where: {
        isRecurring: true,
        status: 'COMPLETED',
        OR: [
          { recurringEndDate: null },
          { recurringEndDate: { gte: now } },
        ],
      },
    });

    for (const task of recurringTasks) {
      const shouldCreate = this.shouldCreateRecurrence(task, now);

      if (shouldCreate) {
        // Create new task instance
        await this.prisma.task.create({
          data: {
            title: task.title,
            description: task.description,
            priority: task.priority,
            estimatedTime: task.estimatedTime,
            creatorId: task.creatorId,
            assigneeId: task.assigneeId,
            workspaceId: task.workspaceId,
            isRecurring: true,
            recurringPattern: task.recurringPattern,
            recurringInterval: task.recurringInterval,
            recurringDays: task.recurringDays,
            recurringEndDate: task.recurringEndDate,
            parentRecurringId: task.parentRecurringId || task.id,
            dueDate: this.calculateNextDueDate(task),
          },
        });

        // Update last recurrence
        await this.prisma.task.update({
          where: { id: task.id },
          data: {
            lastRecurrence: now,
            isRecurring: false, // Mark completed task as non-recurring
          },
        });

        createdCount++;
      }
    }

    return createdCount;
  }

  private shouldCreateRecurrence(
    task: Task,
    now: Date,
  ): boolean {
    if (!task.lastRecurrence) {
      return true;
    }

    const lastRecurrence = new Date(task.lastRecurrence);
    const interval = task.recurringInterval || 1;

    switch (task.recurringPattern) {
      case 'DAILY':
        const daysDiff = Math.floor(
          (now.getTime() - lastRecurrence.getTime()) / (1000 * 60 * 60 * 24),
        );
        return daysDiff >= interval;

      case 'WEEKLY':
        const weeksDiff = Math.floor(
          (now.getTime() - lastRecurrence.getTime()) / (1000 * 60 * 60 * 24 * 7),
        );
        if (weeksDiff >= interval) {
          if (task.recurringDays) {
            try {
              const days = JSON.parse(task.recurringDays) as string[];
              const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
              const currentDay = dayNames[now.getDay()] ?? '';
              return days.includes(currentDay);
            } catch {
              return true;
            }
          }
          return true;
        }
        return false;

      case 'MONTHLY':
        const monthsDiff =
          (now.getFullYear() - lastRecurrence.getFullYear()) * 12 +
          (now.getMonth() - lastRecurrence.getMonth());
        return monthsDiff >= interval;

      case 'YEARLY':
        const yearsDiff = now.getFullYear() - lastRecurrence.getFullYear();
        return yearsDiff >= interval;

      default:
        return false;
    }
  }

  private calculateNextDueDate(task: Task): Date | null {
    if (!task.dueDate) return null;

    const baseDueDate = new Date(task.dueDate);
    const interval = task.recurringInterval || 1;
    const nextDueDate = new Date(baseDueDate);

    switch (task.recurringPattern) {
      case 'DAILY':
        nextDueDate.setDate(nextDueDate.getDate() + interval);
        break;
      case 'WEEKLY':
        nextDueDate.setDate(nextDueDate.getDate() + 7 * interval);
        break;
      case 'MONTHLY':
        nextDueDate.setMonth(nextDueDate.getMonth() + interval);
        break;
      case 'YEARLY':
        nextDueDate.setFullYear(nextDueDate.getFullYear() + interval);
        break;
    }

    return nextDueDate;
  }
}
