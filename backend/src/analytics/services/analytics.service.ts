import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface ProductivityStats {
  tasksCreated: number;
  tasksCompleted: number;
  averageCompletionTime: number;
  tasksByStatus: Record<string, number>;
  tasksByPriority: Record<string, number>;
  timeTracked: number;
  streakDays: number;
}

export interface TeamProductivity {
  userId: string;
  userName: string;
  userAvatar: string | null;
  tasksCompleted: number;
  tasksCreated: number;
  timeTracked: number;
  averageCompletionTime: number;
}

export interface TimeRangeStats {
  date: string;
  tasksCreated: number;
  tasksCompleted: number;
  timeTracked: number;
}

/**
 * Analytics Service - Productivity analytics and usage tracking
 */
@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get personal productivity statistics
   */
  async getPersonalStats(
    userId: string,
    days: number = 30,
  ): Promise<ProductivityStats> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get tasks created
    const tasksCreated = await this.prisma.task.count({
      where: {
        creatorId: userId,
        createdAt: { gte: startDate },
      },
    });

    // Get tasks completed
    const tasksCompleted = await this.prisma.task.count({
      where: {
        OR: [{ creatorId: userId }, { assigneeId: userId }],
        status: 'COMPLETED',
        updatedAt: { gte: startDate },
      },
    });

    // Get tasks by status
    const tasksByStatusRaw = await this.prisma.task.groupBy({
      by: ['status'],
      where: {
        OR: [{ creatorId: userId }, { assigneeId: userId }],
      },
      _count: true,
    });
    const tasksByStatus: Record<string, number> = {};
    tasksByStatusRaw.forEach((item) => {
      tasksByStatus[item.status] = item._count;
    });

    // Get tasks by priority
    const tasksByPriorityRaw = await this.prisma.task.groupBy({
      by: ['priority'],
      where: {
        OR: [{ creatorId: userId }, { assigneeId: userId }],
      },
      _count: true,
    });
    const tasksByPriority: Record<string, number> = {};
    tasksByPriorityRaw.forEach((item) => {
      tasksByPriority[item.priority] = item._count;
    });

    // Get total time tracked
    const timeLogs = await this.prisma.timeLog.aggregate({
      where: {
        userId,
        startTime: { gte: startDate },
      },
      _sum: { duration: true },
    });
    const timeTracked = timeLogs._sum.duration || 0;

    // Calculate average completion time (simplified)
    const completedTasks = await this.prisma.task.findMany({
      where: {
        OR: [{ creatorId: userId }, { assigneeId: userId }],
        status: 'COMPLETED',
        updatedAt: { gte: startDate },
      },
      select: {
        createdAt: true,
        updatedAt: true,
      },
    });

    let averageCompletionTime = 0;
    if (completedTasks.length > 0) {
      const totalTime = completedTasks.reduce((sum, task) => {
        return sum + (task.updatedAt.getTime() - task.createdAt.getTime());
      }, 0);
      averageCompletionTime = Math.round(totalTime / completedTasks.length / (1000 * 60 * 60)); // Hours
    }

    // Calculate streak (simplified - consecutive days with completed tasks)
    const streakDays = await this.calculateStreak(userId);

    return {
      tasksCreated,
      tasksCompleted,
      averageCompletionTime,
      tasksByStatus,
      tasksByPriority,
      timeTracked,
      streakDays,
    };
  }

  /**
   * Get team productivity stats for a workspace
   */
  async getTeamProductivity(
    userId: string,
    workspaceId: string,
    days: number = 30,
  ): Promise<TeamProductivity[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Verify user has access to workspace
    const membership = await this.prisma.workspaceMember.findFirst({
      where: { userId, workspaceId },
    });

    if (!membership) {
      return [];
    }

    // Get all workspace members
    const members = await this.prisma.workspaceMember.findMany({
      where: { workspaceId },
      include: {
        user: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });

    const productivity: TeamProductivity[] = [];

    for (const member of members) {
      const tasksCompleted = await this.prisma.task.count({
        where: {
          workspaceId,
          assigneeId: member.userId,
          status: 'COMPLETED',
          updatedAt: { gte: startDate },
        },
      });

      const tasksCreated = await this.prisma.task.count({
        where: {
          workspaceId,
          creatorId: member.userId,
          createdAt: { gte: startDate },
        },
      });

      const timeLogs = await this.prisma.timeLog.aggregate({
        where: {
          userId: member.userId,
          task: { workspaceId },
          startTime: { gte: startDate },
        },
        _sum: { duration: true },
      });

      productivity.push({
        userId: member.user.id,
        userName: member.user.name,
        userAvatar: member.user.avatar,
        tasksCompleted,
        tasksCreated,
        timeTracked: timeLogs._sum.duration || 0,
        averageCompletionTime: 0, // Could calculate if needed
      });
    }

    // Sort by tasks completed
    return productivity.sort((a, b) => b.tasksCompleted - a.tasksCompleted);
  }

  /**
   * Get daily statistics for a time range
   */
  async getDailyStats(
    userId: string,
    days: number = 30,
  ): Promise<TimeRangeStats[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const stats: TimeRangeStats[] = [];

    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayStart = new Date(date.setHours(0, 0, 0, 0));
      const dayEnd = new Date(date.setHours(23, 59, 59, 999));

      const [tasksCreated, tasksCompleted, timeLogs] = await Promise.all([
        this.prisma.task.count({
          where: {
            creatorId: userId,
            createdAt: { gte: dayStart, lte: dayEnd },
          },
        }),
        this.prisma.task.count({
          where: {
            OR: [{ creatorId: userId }, { assigneeId: userId }],
            status: 'COMPLETED',
            updatedAt: { gte: dayStart, lte: dayEnd },
          },
        }),
        this.prisma.timeLog.aggregate({
          where: {
            userId,
            startTime: { gte: dayStart, lte: dayEnd },
          },
          _sum: { duration: true },
        }),
      ]);

      const dateStr = dayStart.toISOString().split('T')[0] ?? '';
      stats.push({
        date: dateStr,
        tasksCreated,
        tasksCompleted,
        timeTracked: timeLogs._sum.duration || 0,
      });
    }

    return stats.reverse();
  }

  /**
   * Track usage event (for analytics)
   */
  async trackEvent(
    userId: string,
    eventType: string,
    metadata?: Record<string, unknown>,
  ) {
    // This would store in an analytics table
    // For now, just log
    console.log('Analytics event:', { userId, eventType, metadata, timestamp: new Date() });
  }

  /**
   * Calculate productivity streak
   */
  private async calculateStreak(userId: string): Promise<number> {
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      const nextDate = new Date(checkDate);
      nextDate.setDate(nextDate.getDate() + 1);

      const completedToday = await this.prisma.task.count({
        where: {
          OR: [{ creatorId: userId }, { assigneeId: userId }],
          status: 'COMPLETED',
          updatedAt: {
            gte: checkDate,
            lt: nextDate,
          },
        },
      });

      if (completedToday > 0) {
        streak++;
      } else if (i > 0) {
        // Allow today to be skipped
        break;
      }
    }

    return streak;
  }
}
