import { Module, Global } from '@nestjs/common';
import { PrismaService } from './prisma.service';

/**
 * Prisma Module - Global database access
 * Marked as Global so PrismaService is available throughout the app
 */
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
