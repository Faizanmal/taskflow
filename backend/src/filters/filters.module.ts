import { Module } from '@nestjs/common';
import { SavedFilterController } from './controllers/saved-filter.controller';
import { SavedFilterService } from './services/saved-filter.service';
import { SavedFilterRepository } from './repositories/saved-filter.repository';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SavedFilterController],
  providers: [SavedFilterService, SavedFilterRepository],
  exports: [SavedFilterService, SavedFilterRepository],
})
export class FiltersModule {}
