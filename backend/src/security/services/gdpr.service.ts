import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * GDPR Compliance Service
 * Handles data export and account deletion
 */
@Injectable()
export class GdprService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Export all user data (GDPR Article 20 - Data Portability)
   */
  async exportUserData(userId: string) {
    // Get all user data
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        createdTasks: {
          include: {
            comments: true,
            attachments: true,
            timeLogs: true,
          },
        },
        assignedTasks: true,
        notifications: true,
        workspaceMemberships: {
          include: {
            workspace: true,
          },
        },
        comments: true,
        timeLogs: true,
        notificationPrefs: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Sanitize sensitive data
    const exportData = {
      profile: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        theme: user.theme,
        accentColor: user.accentColor,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      tasks: {
        created: user.createdTasks.map((task) => ({
          id: task.id,
          title: task.title,
          description: task.description,
          status: task.status,
          priority: task.priority,
          dueDate: task.dueDate,
          createdAt: task.createdAt,
          updatedAt: task.updatedAt,
          comments: task.comments.map((c) => ({
            id: c.id,
            content: c.content,
            createdAt: c.createdAt,
          })),
          attachments: task.attachments.map((a) => ({
            id: a.id,
            filename: a.filename,
            createdAt: a.createdAt,
          })),
          timeLogs: task.timeLogs.map((t) => ({
            id: t.id,
            startTime: t.startTime,
            endTime: t.endTime,
            duration: t.duration,
          })),
        })),
        assigned: user.assignedTasks.map((task) => ({
          id: task.id,
          title: task.title,
          status: task.status,
          priority: task.priority,
        })),
      },
      workspaces: user.workspaceMemberships.map((membership) => ({
        id: membership.workspace.id,
        name: membership.workspace.name,
        role: membership.role,
        joinedAt: membership.joinedAt,
      })),
      comments: user.comments.map((comment) => ({
        id: comment.id,
        taskId: comment.taskId,
        content: comment.content,
        createdAt: comment.createdAt,
      })),
      timeLogs: user.timeLogs.map((log) => ({
        id: log.id,
        taskId: log.taskId,
        startTime: log.startTime,
        endTime: log.endTime,
        duration: log.duration,
        description: log.description,
      })),
      notifications: user.notifications.map((n) => ({
        id: n.id,
        type: n.type,
        message: n.message,
        read: n.read,
        createdAt: n.createdAt,
      })),
      preferences: user.notificationPrefs,
      exportedAt: new Date().toISOString(),
    };

    return exportData;
  }

  /**
   * Delete user account and all associated data (GDPR Article 17 - Right to Erasure)
   */
  async deleteUserAccount(userId: string) {
    // Begin transaction
    await this.prisma.$transaction(async (tx) => {
      // Delete notifications
      await tx.notification.deleteMany({ where: { userId } });

      // Delete notification preferences
      await tx.notificationPreference.deleteMany({ where: { userId } });

      // Delete time logs
      await tx.timeLog.deleteMany({ where: { userId } });

      // Delete comments
      await tx.comment.deleteMany({ where: { authorId: userId } });

      // Delete mentions
      await tx.mention.deleteMany({ where: { userId } });

      // Remove user from workspace memberships
      await tx.workspaceMember.deleteMany({ where: { userId } });

      // Delete workspace invites
      await tx.workspaceInvite.deleteMany({
        where: { OR: [{ invitedById: userId }, { invitedUserId: userId }] },
      });

      // Reassign or delete tasks where user is assignee
      await tx.task.updateMany({
        where: { assigneeId: userId },
        data: { assigneeId: null },
      });

      // Delete tasks created by user
      await tx.task.deleteMany({ where: { creatorId: userId } });

      // Delete templates created by user
      await tx.taskTemplate.deleteMany({ where: { creatorId: userId } });

      // Finally, delete the user
      await tx.user.delete({ where: { id: userId } });
    });

    return {
      success: true,
      message: 'Account and all associated data have been permanently deleted',
      deletedAt: new Date().toISOString(),
    };
  }

  /**
   * Anonymize user data instead of deleting (alternative for data retention)
   */
  async anonymizeUserData(userId: string) {
    const anonymizedEmail = `deleted-${userId}@anonymized.local`;
    const anonymizedName = 'Deleted User';

    await this.prisma.$transaction(async (tx) => {
      // Anonymize user profile
      await tx.user.update({
        where: { id: userId },
        data: {
          email: anonymizedEmail,
          name: anonymizedName,
          avatar: null,
          password: '', // Clear password
        },
      });

      // Delete notifications
      await tx.notification.deleteMany({ where: { userId } });

      // Delete notification preferences
      await tx.notificationPreference.deleteMany({ where: { userId } });

      // Keep tasks but anonymize personal info
      // Comments and other content remain but are attributed to "Deleted User"
    });

    return {
      success: true,
      message: 'User data has been anonymized',
      anonymizedAt: new Date().toISOString(),
    };
  }
}
