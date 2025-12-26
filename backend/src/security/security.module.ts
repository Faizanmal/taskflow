import { Module } from '@nestjs/common';
import { SecurityController } from './controllers/security.controller';
import { TwoFactorService } from './services/two-factor.service';
import { GdprService } from './services/gdpr.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [SecurityController],
  providers: [TwoFactorService, GdprService],
  exports: [TwoFactorService, GdprService],
})
export class SecurityModule {}
