import {
  Controller,
  Get,
  Patch,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { NotificationService } from '../services/notification.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';

/**
 * Notification Controller - Handles notification endpoints
 */
@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  /**
   * GET /notifications - Get all notifications for current user
   */
  @Get()
  async getNotifications(@CurrentUser('id') userId: string) {
    const notifications =
      await this.notificationService.getNotifications(userId);
    return {
      success: true,
      data: { notifications },
    };
  }

  /**
   * GET /notifications/unread-count - Get unread count
   */
  @Get('unread-count')
  async getUnreadCount(@CurrentUser('id') userId: string) {
    const count = await this.notificationService.getUnreadCount(userId);
    return {
      success: true,
      data: { count },
    };
  }

  /**
   * PATCH /notifications/:id/read - Mark notification as read
   */
  @Patch(':id/read')
  @HttpCode(HttpStatus.OK)
  async markAsRead(@Param('id') id: string) {
    const notification = await this.notificationService.markAsRead(id);
    return {
      success: true,
      data: { notification },
    };
  }

  /**
   * PATCH /notifications/read-all - Mark all notifications as read
   */
  @Patch('read-all')
  @HttpCode(HttpStatus.OK)
  async markAllAsRead(@CurrentUser('id') userId: string) {
    await this.notificationService.markAllAsRead(userId);
    return {
      success: true,
      message: 'All notifications marked as read',
    };
  }
}
