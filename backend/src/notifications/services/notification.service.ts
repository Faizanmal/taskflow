import { Injectable, forwardRef, Inject } from '@nestjs/common';
import { NotificationRepository } from '../repositories/notification.repository';
import { Notification } from '@prisma/client';
import { EventsGateway } from '../../events/events.gateway';

/**
 * Notification Service - Business logic for notifications
 */
@Injectable()
export class NotificationService {
  constructor(
    private readonly notificationRepository: NotificationRepository,
    @Inject(forwardRef(() => EventsGateway))
    private readonly eventsGateway: EventsGateway,
  ) {}

  /**
   * Get all notifications for a user
   */
  async getNotifications(userId: string): Promise<Notification[]> {
    return this.notificationRepository.findByUserId(userId);
  }

  /**
   * Get unread notifications count
   */
  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationRepository.getUnreadCount(userId);
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<Notification> {
    return this.notificationRepository.markAsRead(notificationId);
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationRepository.markAllAsRead(userId);
  }

  /**
   * Create a task assigned notification
   */
  async createTaskAssignedNotification(
    userId: string,
    taskId: string,
    taskTitle: string,
  ): Promise<void> {
    const notification = await this.notificationRepository.create({
      type: 'TASK_ASSIGNED',
      message: `You have been assigned to task: "${taskTitle}"`,
      userId,
      data: { taskId },
    });

    // Emit real-time notification
    this.eventsGateway.emitNotification(userId, notification);
  }

  /**
   * Create a task updated notification
   */
  async createTaskUpdatedNotification(
    userId: string,
    taskId: string,
    taskTitle: string,
  ): Promise<void> {
    const notification = await this.notificationRepository.create({
      type: 'TASK_UPDATED',
      message: `Task "${taskTitle}" has been updated`,
      userId,
      data: { taskId },
    });

    this.eventsGateway.emitNotification(userId, notification);
  }

  /**
   * Create a task completed notification
   */
  async createTaskCompletedNotification(
    userId: string,
    taskId: string,
    taskTitle: string,
  ): Promise<void> {
    const notification = await this.notificationRepository.create({
      type: 'TASK_COMPLETED',
      message: `Task "${taskTitle}" has been completed`,
      userId,
      data: { taskId },
    });

    this.eventsGateway.emitNotification(userId, notification);
  }

  /**
   * Create a task deleted notification
   */
  async createTaskDeletedNotification(
    userId: string,
    taskTitle: string,
  ): Promise<void> {
    const notification = await this.notificationRepository.create({
      type: 'TASK_DELETED',
      message: `Task "${taskTitle}" has been deleted`,
      userId,
      data: {},
    });

    this.eventsGateway.emitNotification(userId, notification);
  }
}
