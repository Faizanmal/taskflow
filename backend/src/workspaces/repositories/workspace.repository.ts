import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  Prisma,
  Workspace,
  WorkspaceMember,
  WorkspaceInvite,
} from '@prisma/client';

/**
 * Workspace with members relation
 */
export type WorkspaceWithMembers = Workspace & {
  members: (WorkspaceMember & {
    user: { id: string; name: string; email: string; avatar: string | null };
  })[];
  _count: { tasks: number; members: number };
};

/**
 * Workspace Repository - Data access layer for Workspace entity
 */
@Injectable()
export class WorkspaceRepository {
  constructor(private readonly prisma: PrismaService) {}

  private readonly includeMembersAndCount = {
    members: {
      include: {
        user: {
          select: { id: true, name: true, email: true, avatar: true },
        },
      },
    },
    _count: {
      select: { tasks: true, members: true },
    },
  };

  /**
   * Create a new workspace
   */
  async create(data: {
    name: string;
    description?: string;
    slug: string;
    avatar?: string;
    creatorId: string;
  }): Promise<WorkspaceWithMembers> {
    return this.prisma.workspace.create({
      data: {
        name: data.name,
        description: data.description || null,
        slug: data.slug,
        avatar: data.avatar || null,
        members: {
          create: {
            userId: data.creatorId,
            role: 'ADMIN',
          },
        },
      },
      include: this.includeMembersAndCount,
    });
  }

  /**
   * Find workspace by ID
   */
  async findById(id: string): Promise<WorkspaceWithMembers | null> {
    return this.prisma.workspace.findUnique({
      where: { id },
      include: this.includeMembersAndCount,
    });
  }

  /**
   * Find workspace by slug
   */
  async findBySlug(slug: string): Promise<WorkspaceWithMembers | null> {
    return this.prisma.workspace.findUnique({
      where: { slug },
      include: this.includeMembersAndCount,
    });
  }

  /**
   * Find all workspaces for a user
   */
  async findAllForUser(userId: string): Promise<WorkspaceWithMembers[]> {
    return this.prisma.workspace.findMany({
      where: {
        members: {
          some: { userId },
        },
      },
      include: this.includeMembersAndCount,
      orderBy: { updatedAt: 'desc' },
    });
  }

  /**
   * Update workspace
   */
  async update(
    id: string,
    data: Prisma.WorkspaceUpdateInput,
  ): Promise<WorkspaceWithMembers> {
    return this.prisma.workspace.update({
      where: { id },
      data,
      include: this.includeMembersAndCount,
    });
  }

  /**
   * Delete workspace
   */
  async delete(id: string): Promise<Workspace> {
    return this.prisma.workspace.delete({
      where: { id },
    });
  }

  /**
   * Check if user is member of workspace
   */
  async isMember(workspaceId: string, userId: string): Promise<boolean> {
    const member = await this.prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: { workspaceId, userId },
      },
    });
    return !!member;
  }

  /**
   * Get member role in workspace
   */
  async getMemberRole(
    workspaceId: string,
    userId: string,
  ): Promise<string | null> {
    const member = await this.prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: { workspaceId, userId },
      },
    });
    return member?.role || null;
  }

  /**
   * Add member to workspace
   */
  async addMember(
    workspaceId: string,
    userId: string,
    role: string = 'MEMBER',
  ): Promise<WorkspaceMember> {
    return this.prisma.workspaceMember.create({
      data: {
        workspaceId,
        userId,
        role,
      },
    });
  }

  /**
   * Update member role
   */
  async updateMemberRole(
    workspaceId: string,
    userId: string,
    role: string,
  ): Promise<WorkspaceMember> {
    return this.prisma.workspaceMember.update({
      where: {
        workspaceId_userId: { workspaceId, userId },
      },
      data: { role },
    });
  }

  /**
   * Remove member from workspace
   */
  async removeMember(workspaceId: string, userId: string): Promise<void> {
    await this.prisma.workspaceMember.delete({
      where: {
        workspaceId_userId: { workspaceId, userId },
      },
    });
  }

  /**
   * Create workspace invite
   */
  async createInvite(data: {
    workspaceId: string;
    email: string;
    role: string;
    token: string;
    invitedById: string;
    expiresAt: Date;
  }): Promise<WorkspaceInvite> {
    return this.prisma.workspaceInvite.create({
      data,
    });
  }

  /**
   * Find invite by token
   */
  async findInviteByToken(token: string): Promise<
    | (WorkspaceInvite & {
        workspace: Workspace;
        invitedBy: { id: string; name: string; email: string };
      })
    | null
  > {
    return this.prisma.workspaceInvite.findUnique({
      where: { token },
      include: {
        workspace: true,
        invitedBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  /**
   * Find pending invites for a workspace
   */
  async findPendingInvites(workspaceId: string): Promise<WorkspaceInvite[]> {
    return this.prisma.workspaceInvite.findMany({
      where: {
        workspaceId,
        status: 'PENDING',
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Find invites for a user email
   */
  async findInvitesForEmail(email: string): Promise<
    (WorkspaceInvite & {
      workspace: Workspace;
      invitedBy: { id: string; name: string; email: string };
    })[]
  > {
    return this.prisma.workspaceInvite.findMany({
      where: {
        email,
        status: 'PENDING',
        expiresAt: { gt: new Date() },
      },
      include: {
        workspace: true,
        invitedBy: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Update invite status
   */
  async updateInviteStatus(
    id: string,
    status: string,
    invitedUserId?: string,
  ): Promise<WorkspaceInvite> {
    return this.prisma.workspaceInvite.update({
      where: { id },
      data: {
        status,
        ...(invitedUserId && { invitedUserId }),
      },
    });
  }

  /**
   * Delete invite
   */
  async deleteInvite(id: string): Promise<void> {
    await this.prisma.workspaceInvite.delete({
      where: { id },
    });
  }

  /**
   * Get workspace analytics
   */
  async getAnalytics(workspaceId: string): Promise<{
    totalTasks: number;
    completedTasks: number;
    inProgressTasks: number;
    overdueTasks: number;
    memberCount: number;
    tasksByMember: { userId: string; name: string; count: number }[];
    tasksByStatus: { status: string; count: number }[];
    tasksByPriority: { priority: string; count: number }[];
  }> {
    const [
      totalTasks,
      completedTasks,
      inProgressTasks,
      overdueTasks,
      memberCount,
      tasksByStatus,
      tasksByPriority,
      tasksByMember,
    ] = await Promise.all([
      this.prisma.task.count({ where: { workspaceId } }),
      this.prisma.task.count({ where: { workspaceId, status: 'COMPLETED' } }),
      this.prisma.task.count({ where: { workspaceId, status: 'IN_PROGRESS' } }),
      this.prisma.task.count({
        where: {
          workspaceId,
          status: { not: 'COMPLETED' },
          dueDate: { lt: new Date() },
        },
      }),
      this.prisma.workspaceMember.count({ where: { workspaceId } }),
      this.prisma.task.groupBy({
        by: ['status'],
        where: { workspaceId },
        _count: true,
      }),
      this.prisma.task.groupBy({
        by: ['priority'],
        where: { workspaceId },
        _count: true,
      }),
      this.prisma.task.groupBy({
        by: ['assigneeId'],
        where: { workspaceId, assigneeId: { not: null } },
        _count: true,
      }),
    ]);

    // Get user names for tasksByMember
    const memberIds = tasksByMember
      .map((t) => t.assigneeId)
      .filter(Boolean) as string[];
    const users = await this.prisma.user.findMany({
      where: { id: { in: memberIds } },
      select: { id: true, name: true },
    });

    const userMap = new Map(users.map((u) => [u.id, u.name]));

    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      overdueTasks,
      memberCount,
      tasksByStatus: tasksByStatus.map((t) => ({
        status: t.status,
        count: t._count,
      })),
      tasksByPriority: tasksByPriority.map((t) => ({
        priority: t.priority,
        count: t._count,
      })),
      tasksByMember: tasksByMember.map((t) => ({
        userId: t.assigneeId!,
        name: userMap.get(t.assigneeId!) || 'Unknown',
        count: t._count,
      })),
    };
  }
}
