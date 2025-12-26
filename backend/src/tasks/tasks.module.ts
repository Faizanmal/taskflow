import { Module, forwardRef } from '@nestjs/common';
import { TaskController } from './controllers/task.controller';
import { BulkTaskController } from './controllers/bulk-task.controller';
import { TaskService } from './services/task.service';
import { BulkTaskService } from './services/bulk-task.service';
import { TaskRepository } from './repositories/task.repository';
import { NotificationsModule } from '../notifications/notifications.module';
import { EventsModule } from '../events/events.module';
import { PrismaModule } from '../prisma/prisma.module';

/**
 * Task Module - Task management functionality
 */
@Module({
  imports: [
    PrismaModule,
    forwardRef(() => NotificationsModule),
    forwardRef(() => EventsModule),
  ],
  controllers: [TaskController, BulkTaskController],
  providers: [TaskService, BulkTaskService, TaskRepository],
  exports: [TaskService, BulkTaskService, TaskRepository],
})
export class TasksModule {}
