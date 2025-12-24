import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TemplateController } from './controllers/template.controller';
import { TemplateService } from './services/template.service';
import { TemplateRepository } from './repositories/template.repository';
import { RecurringTaskScheduler } from './schedulers/recurring-task.scheduler';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule, ScheduleModule.forRoot()],
  controllers: [TemplateController],
  providers: [TemplateService, TemplateRepository, RecurringTaskScheduler],
  exports: [TemplateService, TemplateRepository],
})
export class TemplatesModule {}
