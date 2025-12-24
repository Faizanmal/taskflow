import { Module } from '@nestjs/common';
import { TimeTrackingController } from './controllers/time-tracking.controller';
import { TimeTrackingService } from './services/time-tracking.service';
import { TimeLogRepository } from './repositories/time-log.repository';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TimeTrackingController],
  providers: [TimeTrackingService, TimeLogRepository],
  exports: [TimeTrackingService, TimeLogRepository],
})
export class TimeTrackingModule {}
