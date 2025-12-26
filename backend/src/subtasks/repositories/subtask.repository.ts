import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Task, TaskDependency, Prisma } from '@prisma/client';

/**
 * Subtask with relations
 */
export type SubtaskWithRelations = Task & {
  creator: { id: string; name: string; email: string; avatar: string | null };
  assignee: {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
  } | null;
};

/**
 * Dependency with relations
 */
export type DependencyWithRelations = TaskDependency & {
  dependencyTask: { id: string; title: string; status: string };
  dependentTask: { id: string; title: string; status: string };
};

/**
 * Subtask Repository
 */
@Injectable()
export class SubtaskRepository {
  constructor(private readonly prisma: PrismaService) {}

  private readonly includeRelations = {
    creator: {
      select: { id: true, name: true, email: true, avatar: true },
    },
    assignee: {
      select: { id: true, name: true, email: true, avatar: true },
    },
  };

  /**
   * Create a subtask
   */
  async createSubtask(data: {
    parentTaskId: string;
    title: string;
    description?: string;
    priority?: string;
    dueDate?: Date;
    creatorId: string;
    assigneeId?: string;
    workspaceId?: string;
  }): Promise<SubtaskWithRelations> {
    return this.prisma.task.create({
      data: {
        title: data.title,
        description: data.description || null,
        priority: data.priority || 'MEDIUM',
        dueDate: data.dueDate || null,
        creatorId: data.creatorId,
        assigneeId: data.assigneeId || null,
        parentTaskId: data.parentTaskId,
        workspaceId: data.workspaceId || null,
      },
      include: this.includeRelations,
    });
  }

  /**
   * Find subtasks for a task
   */
  async findSubtasks(parentTaskId: string): Promise<SubtaskWithRelations[]> {
    return this.prisma.task.findMany({
      where: { parentTaskId },
      include: this.includeRelations,
      orderBy: { createdAt: 'asc' },
    });
  }

  /**
   * Get subtask progress
   */
  async getSubtaskProgress(parentTaskId: string): Promise<{
    total: number;
    completed: number;
    percentage: number;
  }> {
    const [total, completed] = await Promise.all([
      this.prisma.task.count({ where: { parentTaskId } }),
      this.prisma.task.count({
        where: { parentTaskId, status: 'COMPLETED' },
      }),
    ]);

    return {
      total,
      completed,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }

  /**
   * Create a dependency
   */
  async createDependency(data: {
    dependentTaskId: string;
    dependencyTaskId: string;
    type?: string;
  }): Promise<DependencyWithRelations> {
    return this.prisma.taskDependency.create({
      data: {
        dependentTaskId: data.dependentTaskId,
        dependencyTaskId: data.dependencyTaskId,
        type: data.type || 'FINISH_TO_START',
      },
      include: {
        dependencyTask: {
          select: { id: true, title: true, status: true },
        },
        dependentTask: {
          select: { id: true, title: true, status: true },
        },
      },
    });
  }

  /**
   * Find dependencies for a task
   */
  async findDependencies(taskId: string): Promise<DependencyWithRelations[]> {
    return this.prisma.taskDependency.findMany({
      where: { dependentTaskId: taskId },
      include: {
        dependencyTask: {
          select: { id: true, title: true, status: true },
        },
        dependentTask: {
          select: { id: true, title: true, status: true },
        },
      },
    });
  }

  /**
   * Find tasks that depend on a task
   */
  async findDependentTasks(taskId: string): Promise<DependencyWithRelations[]> {
    return this.prisma.taskDependency.findMany({
      where: { dependencyTaskId: taskId },
      include: {
        dependencyTask: {
          select: { id: true, title: true, status: true },
        },
        dependentTask: {
          select: { id: true, title: true, status: true },
        },
      },
    });
  }

  /**
   * Delete a dependency
   */
  async deleteDependency(
    dependentTaskId: string,
    dependencyTaskId: string,
  ): Promise<void> {
    await this.prisma.taskDependency.delete({
      where: {
        dependentTaskId_dependencyTaskId: {
          dependentTaskId,
          dependencyTaskId,
        },
      },
    });
  }

  /**
   * Check if dependency exists
   */
  async dependencyExists(
    dependentTaskId: string,
    dependencyTaskId: string,
  ): Promise<boolean> {
    const dep = await this.prisma.taskDependency.findUnique({
      where: {
        dependentTaskId_dependencyTaskId: {
          dependentTaskId,
          dependencyTaskId,
        },
      },
    });
    return !!dep;
  }

  /**
   * Check if adding dependency would create cycle
   */
  async wouldCreateCycle(
    dependentTaskId: string,
    dependencyTaskId: string,
  ): Promise<boolean> {
    // If A depends on B, check if B (or any of B's dependencies) depends on A
    const visited = new Set<string>();
    const queue = [dependencyTaskId];

    while (queue.length > 0) {
      const current = queue.shift()!;
      if (current === dependentTaskId) {
        return true; // Would create a cycle
      }

      if (visited.has(current)) continue;
      visited.add(current);

      const deps = await this.prisma.taskDependency.findMany({
        where: { dependentTaskId: current },
        select: { dependencyTaskId: true },
      });

      for (const dep of deps) {
        queue.push(dep.dependencyTaskId);
      }
    }

    return false;
  }

  /**
   * Update task position (for Kanban)
   */
  async updatePosition(
    taskId: string,
    status: string,
    position: number,
  ): Promise<Task> {
    return this.prisma.task.update({
      where: { id: taskId },
      data: { status, position },
    });
  }

  /**
   * Get tasks by status for Kanban
   */
  async getTasksByStatus(
    userId: string,
    workspaceId?: string,
  ): Promise<Record<string, Task[]>> {
    const where: Prisma.TaskWhereInput = {
      parentTaskId: null, // Only top-level tasks
      ...(workspaceId
        ? { workspaceId }
        : {
            OR: [{ creatorId: userId }, { assigneeId: userId }],
          }),
    };

    const tasks = await this.prisma.task.findMany({
      where,
      orderBy: { position: 'asc' },
      include: {
        creator: {
          select: { id: true, name: true, email: true, avatar: true },
        },
        assignee: {
          select: { id: true, name: true, email: true, avatar: true },
        },
        _count: {
          select: { subtasks: true },
        },
      },
    });

    // Group by status
    const grouped: Record<string, Task[]> = {
      TODO: [],
      IN_PROGRESS: [],
      IN_REVIEW: [],
      COMPLETED: [],
    };

    for (const task of tasks) {
      const statusTasks = grouped[task.status];
      if (statusTasks) {
        statusTasks.push(task);
      }
    }

    return grouped;
  }
}
