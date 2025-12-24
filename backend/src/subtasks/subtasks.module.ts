import { Module } from '@nestjs/common';
import { SubtaskController } from './controllers/subtask.controller';
import { SubtaskService } from './services/subtask.service';
import { SubtaskRepository } from './repositories/subtask.repository';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SubtaskController],
  providers: [SubtaskService, SubtaskRepository],
  exports: [SubtaskService, SubtaskRepository],
})
export class SubtasksModule {}
