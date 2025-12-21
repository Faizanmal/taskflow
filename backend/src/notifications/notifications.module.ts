import { Module, forwardRef } from '@nestjs/common';
import { NotificationController } from './controllers/notification.controller';
import { NotificationService } from './services/notification.service';
import { NotificationRepository } from './repositories/notification.repository';
import { EventsModule } from '../events/events.module';

/**
 * Notifications Module - Notification management
 */
@Module({
  imports: [forwardRef(() => EventsModule)],
  controllers: [NotificationController],
  providers: [NotificationService, NotificationRepository],
  exports: [NotificationService],
})
export class NotificationsModule {}
