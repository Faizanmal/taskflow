import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import {
  SubtaskRepository,
  SubtaskWithRelations,
  DependencyWithRelations,
} from '../repositories/subtask.repository';
import {
  CreateSubtaskDto,
  CreateDependencyDto,
  ReorderTasksDto,
} from '../dto/subtask.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { Task } from '@prisma/client';

/**
 * Subtask Service - Business logic for subtasks and dependencies
 */
@Injectable()
export class SubtaskService {
  constructor(
    private readonly subtaskRepository: SubtaskRepository,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Create a subtask
   */
  async createSubtask(
    parentTaskId: string,
    dto: CreateSubtaskDto,
    userId: string,
  ): Promise<SubtaskWithRelations> {
    // Verify parent task exists
    const parentTask = await this.prisma.task.findUnique({
      where: { id: parentTaskId },
      select: { id: true, workspaceId: true },
    });

    if (!parentTask) {
      throw new NotFoundException('Parent task not found');
    }

    return this.subtaskRepository.createSubtask({
      parentTaskId,
      title: dto.title,
      creatorId: userId,
      ...(dto.description && { description: dto.description }),
      ...(dto.priority && { priority: dto.priority }),
      ...(dto.dueDate && { dueDate: new Date(dto.dueDate) }),
      ...(dto.assigneeId && { assigneeId: dto.assigneeId }),
      ...(parentTask.workspaceId && { workspaceId: parentTask.workspaceId }),
    });
  }

  /**
   * Get subtasks for a task
   */
  async getSubtasks(parentTaskId: string): Promise<SubtaskWithRelations[]> {
    return this.subtaskRepository.findSubtasks(parentTaskId);
  }

  /**
   * Get subtask progress
   */
  async getSubtaskProgress(parentTaskId: string) {
    return this.subtaskRepository.getSubtaskProgress(parentTaskId);
  }

  /**
   * Add a dependency
   */
  async addDependency(
    taskId: string,
    dto: CreateDependencyDto,
  ): Promise<DependencyWithRelations> {
    // Verify both tasks exist
    const [task, dependencyTask] = await Promise.all([
      this.prisma.task.findUnique({
        where: { id: taskId },
        select: { id: true },
      }),
      this.prisma.task.findUnique({
        where: { id: dto.dependencyTaskId },
        select: { id: true },
      }),
    ]);

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    if (!dependencyTask) {
      throw new NotFoundException('Dependency task not found');
    }

    // Check if dependency already exists
    const exists = await this.subtaskRepository.dependencyExists(
      taskId,
      dto.dependencyTaskId,
    );
    if (exists) {
      throw new BadRequestException('Dependency already exists');
    }

    // Check for cycles
    const wouldCycle = await this.subtaskRepository.wouldCreateCycle(
      taskId,
      dto.dependencyTaskId,
    );
    if (wouldCycle) {
      throw new BadRequestException(
        'Adding this dependency would create a circular dependency',
      );
    }

    return this.subtaskRepository.createDependency({
      dependentTaskId: taskId,
      dependencyTaskId: dto.dependencyTaskId,
      ...(dto.type && { type: dto.type }),
    });
  }

  /**
   * Get dependencies for a task
   */
  async getDependencies(taskId: string): Promise<DependencyWithRelations[]> {
    return this.subtaskRepository.findDependencies(taskId);
  }

  /**
   * Get tasks that depend on a task
   */
  async getDependentTasks(taskId: string): Promise<DependencyWithRelations[]> {
    return this.subtaskRepository.findDependentTasks(taskId);
  }

  /**
   * Remove a dependency
   */
  async removeDependency(
    taskId: string,
    dependencyTaskId: string,
  ): Promise<void> {
    const exists = await this.subtaskRepository.dependencyExists(
      taskId,
      dependencyTaskId,
    );

    if (!exists) {
      throw new NotFoundException('Dependency not found');
    }

    await this.subtaskRepository.deleteDependency(taskId, dependencyTaskId);
  }

  /**
   * Check if task can start (all dependencies completed)
   */
  async canTaskStart(taskId: string): Promise<{
    canStart: boolean;
    blockingTasks: { id: string; title: string; status: string }[];
  }> {
    const dependencies = await this.subtaskRepository.findDependencies(taskId);

    const blockingTasks = dependencies
      .filter((dep) => {
        if (dep.type === 'FINISH_TO_START') {
          return dep.dependencyTask.status !== 'COMPLETED';
        }
        // Add other dependency type logic as needed
        return false;
      })
      .map((dep) => dep.dependencyTask);

    return {
      canStart: blockingTasks.length === 0,
      blockingTasks,
    };
  }

  /**
   * Reorder task (for Kanban)
   */
  async reorderTask(dto: ReorderTasksDto): Promise<Task> {
    const task = await this.prisma.task.findUnique({
      where: { id: dto.taskId },
      select: { id: true, status: true },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // If status is changing, check dependencies
    if (dto.newStatus !== task.status && dto.newStatus !== 'TODO') {
      const { canStart, blockingTasks } = await this.canTaskStart(dto.taskId);
      if (!canStart && dto.newStatus === 'IN_PROGRESS') {
        throw new BadRequestException(
          `Cannot start task. Blocked by: ${blockingTasks.map((t) => t.title).join(', ')}`,
        );
      }
    }

    return this.subtaskRepository.updatePosition(
      dto.taskId,
      dto.newStatus,
      dto.position ?? 0,
    );
  }

  /**
   * Get tasks grouped by status for Kanban
   */
  async getKanbanBoard(userId: string, workspaceId?: string) {
    return this.subtaskRepository.getTasksByStatus(userId, workspaceId);
  }
}
