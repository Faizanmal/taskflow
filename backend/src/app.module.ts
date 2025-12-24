import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { TasksModule } from './tasks/tasks.module';
import { NotificationsModule } from './notifications/notifications.module';
import { EventsModule } from './events/events.module';
import { WorkspacesModule } from './workspaces/workspaces.module';
import { CommentsModule } from './comments/comments.module';
import { SubtasksModule } from './subtasks/subtasks.module';
import { TimeTrackingModule } from './time-tracking/time-tracking.module';
import { AttachmentsModule } from './attachments/attachments.module';
import { TemplatesModule } from './templates/templates.module';
import { FiltersModule } from './filters/filters.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),
    PrismaModule,
    AuthModule,
    TasksModule,
    NotificationsModule,
    EventsModule,
    WorkspacesModule,
    CommentsModule,
    SubtasksModule,
    TimeTrackingModule,
    AttachmentsModule,
    TemplatesModule,
    FiltersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
