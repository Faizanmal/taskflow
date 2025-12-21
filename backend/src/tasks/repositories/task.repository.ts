import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Task, Prisma } from '@prisma/client';

/**
 * Task with creator and assignee relations
 */
export type TaskWithRelations = Task & {
  creator: { id: string; name: string; email: string; avatar: string | null };
  assignee: {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
  } | null;
};

/**
 * Task filter options
 */
export interface TaskFilterOptions {
  status?: string;
  priority?: string;
  sortBy?: 'dueDate' | 'createdAt' | 'priority' | 'status';
  sortOrder?: 'asc' | 'desc';
  view?: 'all' | 'assigned' | 'created' | 'overdue';
  userId: string;
}

/**
 * Task Repository - Data access layer for Task entity
 */
@Injectable()
export class TaskRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Include relations for task queries
   */
  private readonly includeRelations = {
    creator: {
      select: { id: true, name: true, email: true, avatar: true },
    },
    assignee: {
      select: { id: true, name: true, email: true, avatar: true },
    },
  };

  /**
   * Create a new task
   */
  async create(data: {
    title: string;
    description?: string | undefined;
    status?: string | undefined;
    priority?: string | undefined;
    dueDate?: Date | undefined;
    creatorId: string;
    assigneeId?: string | undefined;
  }): Promise<TaskWithRelations> {
    return this.prisma.task.create({
      data: {
        title: data.title,
        description: data.description || null,
        status: data.status || 'TODO',
        priority: data.priority || 'MEDIUM',
        dueDate: data.dueDate || null,
        creatorId: data.creatorId,
        assigneeId: data.assigneeId || null,
      },
      include: this.includeRelations,
    });
  }

  /**
   * Find task by ID
   */
  async findById(id: string): Promise<TaskWithRelations | null> {
    return this.prisma.task.findUnique({
      where: { id },
      include: this.includeRelations,
    });
  }

  /**
   * Find all tasks with filters
   */
  async findAll(options: TaskFilterOptions): Promise<TaskWithRelations[]> {
    const where: Prisma.TaskWhereInput = {};

    // Apply status filter
    if (options.status) {
      where.status = options.status;
    }

    // Apply priority filter
    if (options.priority) {
      where.priority = options.priority;
    }

    // Apply view filter
    switch (options.view) {
      case 'assigned':
        where.assigneeId = options.userId;
        break;
      case 'created':
        where.creatorId = options.userId;
        break;
      case 'overdue':
        where.dueDate = { lt: new Date() };
        where.status = { not: 'COMPLETED' };
        break;
      default:
        // 'all' - show tasks where user is creator OR assignee
        where.OR = [
          { creatorId: options.userId },
          { assigneeId: options.userId },
        ];
    }

    // Build orderBy
    const orderBy: Prisma.TaskOrderByWithRelationInput = {};
    const sortField = options.sortBy || 'createdAt';
    const sortDirection = options.sortOrder || 'desc';

    if (sortField === 'priority') {
      // Custom priority ordering
      orderBy.priority = sortDirection;
    } else {
      orderBy[sortField] = sortDirection;
    }

    return this.prisma.task.findMany({
      where,
      orderBy,
      include: this.includeRelations,
    });
  }

  /**
   * Update a task
   */
  async update(
    id: string,
    data: Prisma.TaskUpdateInput,
  ): Promise<TaskWithRelations> {
    return this.prisma.task.update({
      where: { id },
      data,
      include: this.includeRelations,
    });
  }

  /**
   * Delete a task
   */
  async delete(id: string): Promise<Task> {
    return this.prisma.task.delete({
      where: { id },
    });
  }

  /**
   * Get dashboard statistics for a user
   */
  async getDashboardStats(userId: string): Promise<{
    totalAssigned: number;
    totalCreated: number;
    overdue: number;
    completed: number;
    inProgress: number;
  }> {
    const [totalAssigned, totalCreated, overdue, completed, inProgress] =
      await Promise.all([
        this.prisma.task.count({
          where: { assigneeId: userId },
        }),
        this.prisma.task.count({
          where: { creatorId: userId },
        }),
        this.prisma.task.count({
          where: {
            OR: [{ creatorId: userId }, { assigneeId: userId }],
            dueDate: { lt: new Date() },
            status: { not: 'COMPLETED' },
          },
        }),
        this.prisma.task.count({
          where: {
            OR: [{ creatorId: userId }, { assigneeId: userId }],
            status: 'COMPLETED',
          },
        }),
        this.prisma.task.count({
          where: {
            OR: [{ creatorId: userId }, { assigneeId: userId }],
            status: 'IN_PROGRESS',
          },
        }),
      ]);

    return { totalAssigned, totalCreated, overdue, completed, inProgress };
  }
}
