import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import {
  BulkUpdateTasksDto,
  BulkDeleteTasksDto,
  ReorderTasksDto,
  ExportTasksDto,
  ImportTasksDto,
} from '../dto/bulk-task.dto';
import { EventsGateway } from '../../events/events.gateway';

/**
 * Bulk Task Service - Handles bulk operations on tasks
 */
@Injectable()
export class BulkTaskService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventsGateway: EventsGateway,
  ) {}

  /**
   * Bulk update multiple tasks
   */
  async bulkUpdate(userId: string, dto: BulkUpdateTasksDto) {
    // Verify user has access to all tasks
    const tasks = await this.prisma.task.findMany({
      where: {
        id: { in: dto.taskIds },
        creatorId: userId,
      },
    });

    if (tasks.length !== dto.taskIds.length) {
      throw new ForbiddenException(
        'You do not have permission to update one or more tasks',
      );
    }

    const updateData: Prisma.TaskUpdateManyMutationInput = {};
    if (dto.status) updateData.status = dto.status;
    if (dto.priority) updateData.priority = dto.priority;

    // Handle assignee update separately if needed
    if (dto.assigneeId !== undefined) {
      await this.prisma.task.updateMany({
        where: { id: { in: dto.taskIds } },
        data: {
          ...updateData,
          assigneeId: dto.assigneeId,
        },
      });
    } else {
      await this.prisma.task.updateMany({
        where: { id: { in: dto.taskIds } },
        data: updateData,
      });
    }

    // Emit events for each updated task
    dto.taskIds.forEach((taskId) => {
      this.eventsGateway.emitTaskUpdated({
        id: taskId,
        ...updateData,
      } as never);
    });

    return {
      success: true,
      updatedCount: dto.taskIds.length,
    };
  }

  /**
   * Bulk delete multiple tasks
   */
  async bulkDelete(userId: string, dto: BulkDeleteTasksDto) {
    // Verify user has access to all tasks
    const tasks = await this.prisma.task.findMany({
      where: {
        id: { in: dto.taskIds },
        creatorId: userId,
      },
    });

    if (tasks.length !== dto.taskIds.length) {
      throw new ForbiddenException(
        'You do not have permission to delete one or more tasks',
      );
    }

    await this.prisma.task.deleteMany({
      where: { id: { in: dto.taskIds } },
    });

    // Emit events for each deleted task
    dto.taskIds.forEach((taskId) => {
      this.eventsGateway.emitTaskDeleted(taskId);
    });

    return {
      success: true,
      deletedCount: dto.taskIds.length,
    };
  }

  /**
   * Reorder task (drag & drop support)
   */
  async reorderTask(userId: string, dto: ReorderTasksDto) {
    const task = await this.prisma.task.findFirst({
      where: {
        id: dto.taskId,
        OR: [{ creatorId: userId }, { assigneeId: userId }],
      },
    });

    if (!task) {
      throw new ForbiddenException('Task not found or access denied');
    }

    const updateData: Prisma.TaskUpdateInput = {
      position: dto.newPosition,
    };

    if (dto.newStatus) {
      updateData.status = dto.newStatus;
    }

    // Update positions of other tasks
    if (dto.newStatus && dto.newStatus !== task.status) {
      // Moving to a different column - shift tasks in both columns
      await this.prisma.task.updateMany({
        where: {
          status: task.status,
          position: { gt: task.position },
          OR: [{ creatorId: userId }, { assigneeId: userId }],
        },
        data: { position: { decrement: 1 } },
      });

      await this.prisma.task.updateMany({
        where: {
          status: dto.newStatus,
          position: { gte: dto.newPosition },
          OR: [{ creatorId: userId }, { assigneeId: userId }],
        },
        data: { position: { increment: 1 } },
      });
    } else {
      // Moving within the same column
      if (dto.newPosition > task.position) {
        await this.prisma.task.updateMany({
          where: {
            status: task.status,
            position: { gt: task.position, lte: dto.newPosition },
            id: { not: task.id },
            OR: [{ creatorId: userId }, { assigneeId: userId }],
          },
          data: { position: { decrement: 1 } },
        });
      } else {
        await this.prisma.task.updateMany({
          where: {
            status: task.status,
            position: { gte: dto.newPosition, lt: task.position },
            id: { not: task.id },
            OR: [{ creatorId: userId }, { assigneeId: userId }],
          },
          data: { position: { increment: 1 } },
        });
      }
    }

    const updatedTask = await this.prisma.task.update({
      where: { id: dto.taskId },
      data: updateData,
      include: {
        creator: {
          select: { id: true, name: true, email: true, avatar: true },
        },
        assignee: {
          select: { id: true, name: true, email: true, avatar: true },
        },
      },
    });

    this.eventsGateway.emitTaskUpdated(updatedTask);

    return updatedTask;
  }

  /**
   * Export tasks to CSV or JSON
   */
  async exportTasks(userId: string, dto: ExportTasksDto) {
    const where: Prisma.TaskWhereInput = {
      OR: [{ creatorId: userId }, { assigneeId: userId }],
    };

    if (dto.workspaceId) {
      where.workspaceId = dto.workspaceId;
    }
    if (dto.status) {
      where.status = dto.status;
    }

    const tasks = await this.prisma.task.findMany({
      where,
      include: {
        creator: { select: { name: true, email: true } },
        assignee: { select: { name: true, email: true } },
        workspace: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (dto.format === 'csv') {
      const headers = [
        'ID',
        'Title',
        'Description',
        'Status',
        'Priority',
        'Due Date',
        'Creator',
        'Assignee',
        'Workspace',
        'Created At',
      ];
      const rows = tasks.map((task) => [
        task.id,
        `"${task.title.replace(/"/g, '""')}"`,
        `"${(task.description || '').replace(/"/g, '""')}"`,
        task.status,
        task.priority,
        task.dueDate ? task.dueDate.toISOString() : '',
        task.creator.name,
        task.assignee?.name || '',
        task.workspace?.name || '',
        task.createdAt.toISOString(),
      ]);

      return {
        format: 'csv',
        data: [headers.join(','), ...rows.map((r) => r.join(','))].join('\n'),
        filename: `tasks-export-${Date.now()}.csv`,
      };
    }

    return {
      format: 'json',
      data: tasks.map((task) => ({
        id: task.id,
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate,
        creator: task.creator.name,
        assignee: task.assignee?.name,
        workspace: task.workspace?.name,
        createdAt: task.createdAt,
      })),
      filename: `tasks-export-${Date.now()}.json`,
    };
  }

  /**
   * Import tasks from data
   */
  async importTasks(userId: string, dto: ImportTasksDto) {
    const created = await this.prisma.task.createMany({
      data: dto.tasks.map((task) => ({
        title: task.title,
        description: task.description || null,
        status: task.status || 'TODO',
        priority: task.priority || 'MEDIUM',
        dueDate: task.dueDate ? new Date(task.dueDate) : null,
        creatorId: userId,
        workspaceId: dto.workspaceId || null,
      })),
    });

    return {
      success: true,
      importedCount: created.count,
    };
  }
}
