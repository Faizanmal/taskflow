import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

/**
 * Search result types
 */
export interface TaskSearchResult {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  dueDate: Date | null;
  assignee: {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
  } | null;
  workspace: {
    id: string;
    name: string;
    slug: string;
  } | null;
}

export interface WorkspaceSearchResult {
  id: string;
  name: string;
  description: string | null;
  slug: string;
  avatar: string | null;
  _count: {
    members: number;
    tasks: number;
  };
}

export interface UserSearchResult {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
}

export interface GlobalSearchResult {
  tasks: TaskSearchResult[];
  workspaces: WorkspaceSearchResult[];
  users: UserSearchResult[];
}

/**
 * Search Repository - Data access layer for search operations
 * Optimized queries for full-text search across entities
 */
@Injectable()
export class SearchRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Search tasks by title, description, or assignee name
   */
  async searchTasks(
    userId: string,
    searchTerm: string,
    limit: number = 10,
  ): Promise<TaskSearchResult[]> {
    return this.prisma.task.findMany({
      where: {
        AND: [
          // User access check
          {
            OR: [
              { creatorId: userId },
              { assigneeId: userId },
              {
                workspace: {
                  members: {
                    some: { userId },
                  },
                },
              },
            ],
          },
          // Search conditions
          {
            OR: [
              { title: { contains: searchTerm } },
              { description: { contains: searchTerm } },
              {
                assignee: {
                  name: { contains: searchTerm },
                },
              },
            ],
          },
        ],
      },
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        priority: true,
        dueDate: true,
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        workspace: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: [{ updatedAt: 'desc' }],
      take: limit,
    });
  }

  /**
   * Advanced task search with filters
   */
  async searchTasksAdvanced(
    userId: string,
    searchTerm: string,
    options?: {
      status?: string;
      priority?: string;
      assigneeId?: string;
      workspaceId?: string;
      limit?: number;
      offset?: number;
    },
  ): Promise<TaskSearchResult[]> {
    const where: Prisma.TaskWhereInput = {
      AND: [
        // User access check
        {
          OR: [
            { creatorId: userId },
            { assigneeId: userId },
            {
              workspace: {
                members: {
                  some: { userId },
                },
              },
            },
          ],
        },
        // Search conditions
        {
          OR: [
            { title: { contains: searchTerm } },
            { description: { contains: searchTerm } },
            {
              assignee: {
                name: { contains: searchTerm },
              },
            },
          ],
        },
      ],
    };

    // Apply additional filters
    if (options?.status) {
      (where.AND as Prisma.TaskWhereInput[]).push({ status: options.status });
    }
    if (options?.priority) {
      (where.AND as Prisma.TaskWhereInput[]).push({
        priority: options.priority,
      });
    }
    if (options?.assigneeId) {
      (where.AND as Prisma.TaskWhereInput[]).push({
        assigneeId: options.assigneeId,
      });
    }
    if (options?.workspaceId) {
      (where.AND as Prisma.TaskWhereInput[]).push({
        workspaceId: options.workspaceId,
      });
    }

    return this.prisma.task.findMany({
      where,
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        priority: true,
        dueDate: true,
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        workspace: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: [{ updatedAt: 'desc' }],
      take: options?.limit || 10,
      skip: options?.offset || 0,
    });
  }

  /**
   * Search workspaces by name or description
   */
  async searchWorkspaces(
    userId: string,
    searchTerm: string,
    limit: number = 10,
  ): Promise<WorkspaceSearchResult[]> {
    return this.prisma.workspace.findMany({
      where: {
        AND: [
          // User is a member
          {
            members: {
              some: { userId },
            },
          },
          // Search conditions
          {
            OR: [
              { name: { contains: searchTerm } },
              { description: { contains: searchTerm } },
              { slug: { contains: searchTerm } },
            ],
          },
        ],
      },
      select: {
        id: true,
        name: true,
        description: true,
        slug: true,
        avatar: true,
        _count: {
          select: {
            members: true,
            tasks: true,
          },
        },
      },
      orderBy: [{ updatedAt: 'desc' }],
      take: limit,
    });
  }

  /**
   * Search users by name or email
   * Only returns users the current user has access to (same workspace members)
   */
  async searchUsers(
    userId: string,
    searchTerm: string,
    limit: number = 10,
  ): Promise<UserSearchResult[]> {
    // Get all workspace IDs the user is a member of
    const userWorkspaces = await this.prisma.workspaceMember.findMany({
      where: { userId },
      select: { workspaceId: true },
    });

    const workspaceIds = userWorkspaces.map((w) => w.workspaceId);

    // Search users who are members of the same workspaces
    return this.prisma.user.findMany({
      where: {
        AND: [
          {
            OR: [
              { name: { contains: searchTerm } },
              { email: { contains: searchTerm } },
            ],
          },
          {
            workspaceMemberships: {
              some: {
                workspaceId: { in: workspaceIds },
              },
            },
          },
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
      },
      orderBy: [{ name: 'asc' }],
      take: limit,
    });
  }
}
