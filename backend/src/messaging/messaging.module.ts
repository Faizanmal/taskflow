import { Module } from '@nestjs/common';
import { MessagingController } from './controllers/messaging.controller';
import { MessagingService } from './services/messaging.service';
import { MessagingRepository } from './repositories/messaging.repository';
import { PrismaModule } from '../prisma/prisma.module';
import { EventsModule } from '../events/events.module';

@Module({
  imports: [PrismaModule, EventsModule],
  controllers: [MessagingController],
  providers: [MessagingService, MessagingRepository],
  exports: [MessagingService],
})
export class MessagingModule {}
