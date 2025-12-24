import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Notification } from '@prisma/client';

/**
 * Notification Repository - Data access layer for Notification entity
 */
@Injectable()
export class NotificationRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new notification
   */
  async create(data: {
    type: string;
    message: string;
    userId: string;
    data?: Record<string, any>;
  }): Promise<Notification> {
    return this.prisma.notification.create({
      data: {
        type: data.type,
        message: data.message,
        userId: data.userId,
        data: data.data ? JSON.stringify(data.data) : null,
      },
    });
  }

  /**
   * Find all notifications for a user
   */
  async findByUserId(userId: string): Promise<Notification[]> {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50, // Limit to last 50 notifications
    });
  }

  /**
   * Find unread notifications for a user
   */
  async findUnreadByUserId(userId: string): Promise<Notification[]> {
    return this.prisma.notification.findMany({
      where: { userId, read: false },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get unread count for a user
   */
  async getUnreadCount(userId: string): Promise<number> {
    return this.prisma.notification.count({
      where: { userId, read: false },
    });
  }

  /**
   * Mark notification as read
   */
  async markAsRead(id: string): Promise<Notification> {
    return this.prisma.notification.update({
      where: { id },
      data: { read: true },
    });
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: string): Promise<void> {
    await this.prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
  }

  /**
   * Delete a notification
   */
  async delete(id: string): Promise<void> {
    await this.prisma.notification.delete({
      where: { id },
    });
  }

  /**
   * Delete notifications older than a date
   */
  async deleteOlderThan(date: Date): Promise<number> {
    const result = await this.prisma.notification.deleteMany({
      where: { createdAt: { lt: date } },
    });
    return result.count;
  }
}
