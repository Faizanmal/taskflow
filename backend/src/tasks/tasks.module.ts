import { Module, forwardRef } from '@nestjs/common';
import { TaskController } from './controllers/task.controller';
import { TaskService } from './services/task.service';
import { TaskRepository } from './repositories/task.repository';
import { NotificationsModule } from '../notifications/notifications.module';
import { EventsModule } from '../events/events.module';

/**
 * Task Module - Task management functionality
 */
@Module({
  imports: [
    forwardRef(() => NotificationsModule),
    forwardRef(() => EventsModule),
  ],
  controllers: [TaskController],
  providers: [TaskService, TaskRepository],
  exports: [TaskService, TaskRepository],
})
export class TasksModule {}
