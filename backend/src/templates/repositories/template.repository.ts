import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TaskTemplate, Prisma } from '@prisma/client';

/**
 * Template with relations
 */
export type TemplateWithRelations = TaskTemplate & {
  creator: { id: string; name: string; email: string; avatar: string | null };
  workspace: { id: string; name: string } | null;
  _count: { tasks: number };
};

/**
 * Template Repository - Data access layer for TaskTemplate entity
 */
@Injectable()
export class TemplateRepository {
  constructor(private readonly prisma: PrismaService) {}

  private readonly includeRelations = {
    creator: {
      select: { id: true, name: true, email: true, avatar: true },
    },
    workspace: {
      select: { id: true, name: true },
    },
    _count: {
      select: { tasks: true },
    },
  };

  /**
   * Create a template
   */
  async create(data: {
    name: string;
    description?: string;
    taskTitle: string;
    taskDescription?: string;
    taskPriority?: string;
    estimatedTime?: number;
    isPublic?: boolean;
    creatorId: string;
    workspaceId?: string;
    subtaskTemplates?: string;
  }): Promise<TemplateWithRelations> {
    return this.prisma.taskTemplate.create({
      data: {
        name: data.name,
        description: data.description || null,
        taskTitle: data.taskTitle,
        taskDescription: data.taskDescription || null,
        taskPriority: data.taskPriority || 'MEDIUM',
        estimatedTime: data.estimatedTime || null,
        isPublic: data.isPublic ?? false,
        creatorId: data.creatorId,
        workspaceId: data.workspaceId || null,
        subtaskTemplates: data.subtaskTemplates || null,
      },
      include: this.includeRelations,
    });
  }

  /**
   * Find template by ID
   */
  async findById(id: string): Promise<TemplateWithRelations | null> {
    return this.prisma.taskTemplate.findUnique({
      where: { id },
      include: this.includeRelations,
    });
  }

  /**
   * Find templates for user (personal + public in workspaces)
   */
  async findForUser(
    userId: string,
    workspaceId?: string,
  ): Promise<TemplateWithRelations[]> {
    if (workspaceId) {
      // Templates for specific workspace
      return this.prisma.taskTemplate.findMany({
        where: {
          OR: [
            { workspaceId, isPublic: true },
            { workspaceId, creatorId: userId },
          ],
        },
        include: this.includeRelations,
        orderBy: { createdAt: 'desc' },
      });
    }

    // Personal templates
    return this.prisma.taskTemplate.findMany({
      where: {
        creatorId: userId,
        workspaceId: null,
      },
      include: this.includeRelations,
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Update a template
   */
  async update(
    id: string,
    data: Prisma.TaskTemplateUpdateInput,
  ): Promise<TemplateWithRelations> {
    return this.prisma.taskTemplate.update({
      where: { id },
      data,
      include: this.includeRelations,
    });
  }

  /**
   * Delete a template
   */
  async delete(id: string): Promise<TaskTemplate> {
    return this.prisma.taskTemplate.delete({
      where: { id },
    });
  }
}
