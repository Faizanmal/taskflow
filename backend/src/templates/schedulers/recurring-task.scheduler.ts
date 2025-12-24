import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { TemplateService } from '../services/template.service';

/**
 * Scheduler for processing recurring tasks
 */
@Injectable()
export class RecurringTaskScheduler {
  private readonly logger = new Logger(RecurringTaskScheduler.name);

  constructor(private readonly templateService: TemplateService) {}

  /**
   * Run every hour to process recurring tasks
   */
  @Cron(CronExpression.EVERY_HOUR)
  async handleRecurringTasks() {
    this.logger.log('Processing recurring tasks...');
    try {
      const createdCount = await this.templateService.processRecurringTasks();
      this.logger.log(`Created ${createdCount} recurring task instances`);
    } catch (error) {
      this.logger.error('Error processing recurring tasks', error);
    }
  }
}
