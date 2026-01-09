import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  UseGuards,
  Res,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TwoFactorService } from '../services/two-factor.service';
import { GdprService } from '../services/gdpr.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { Enable2FADto, Verify2FADto, Disable2FADto } from '../dto/security.dto';

/**
 * Security Controller - Handles 2FA and GDPR endpoints
 */
@ApiTags('Security')
@Controller('security')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SecurityController {
  constructor(
    private readonly twoFactorService: TwoFactorService,
    private readonly gdprService: GdprService,
  ) {}

  // ============= Two-Factor Authentication =============

  /**
   * GET /security/2fa/setup - Get 2FA setup info (QR code)
   */
  @Get('2fa/setup')
  @ApiOperation({ summary: 'Get 2FA setup QR code' })
  async setup2FA(@CurrentUser('id') userId: string) {
    const result = await this.twoFactorService.generateSecret(userId);
    return {
      success: true,
      data: result,
    };
  }

  /**
   * POST /security/2fa/enable - Enable 2FA
   */
  @Post('2fa/enable')
  @ApiOperation({ summary: 'Enable 2FA for account' })
  async enable2FA(
    @CurrentUser('id') userId: string,
    @Body() dto: Enable2FADto,
  ) {
    const result = await this.twoFactorService.enable2FA(
      userId,
      dto.secret,
      dto.token,
    );
    return {
      success: true,
      message: '2FA enabled successfully',
      data: result,
    };
  }

  /**
   * POST /security/2fa/verify - Verify 2FA token
   */
  @Post('2fa/verify')
  @ApiOperation({ summary: 'Verify 2FA token' })
  @HttpCode(HttpStatus.OK)
  async verify2FA(
    @CurrentUser('id') userId: string,
    @Body() dto: Verify2FADto,
  ) {
    const isValid = await this.twoFactorService.verify2FA(userId, dto.token);
    return {
      success: true,
      data: { valid: isValid },
    };
  }

  /**
   * POST /security/2fa/disable - Disable 2FA
   */
  @Post('2fa/disable')
  @ApiOperation({ summary: 'Disable 2FA for account' })
  @HttpCode(HttpStatus.OK)
  async disable2FA(
    @CurrentUser('id') userId: string,
    @Body() dto: Disable2FADto,
  ) {
    await this.twoFactorService.disable2FA(userId, dto.token);
    return {
      success: true,
      message: '2FA disabled successfully',
    };
  }

  // ============= GDPR Compliance =============

  /**
   * GET /security/gdpr/export - Export all user data
   */
  @Get('gdpr/export')
  @ApiOperation({ summary: 'Export all user data (GDPR)' })
  async exportData(@CurrentUser('id') userId: string, @Res() res: Response) {
    const data = await this.gdprService.exportUserData(userId);

    res.setHeader('Content-Type', 'application/json');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="taskflow-data-export-${Date.now()}.json"`,
    );
    res.send(JSON.stringify(data, null, 2));
  }

  /**
   * DELETE /security/gdpr/delete-account - Permanently delete account
   */
  @Delete('gdpr/delete-account')
  @ApiOperation({ summary: 'Permanently delete account and all data (GDPR)' })
  @HttpCode(HttpStatus.OK)
  async deleteAccount(@CurrentUser('id') userId: string) {
    // In production, verify password before deletion
    const result = await this.gdprService.deleteUserAccount(userId);
    return {
      success: true,
      message: result.message,
      data: { deletedAt: result.deletedAt },
    };
  }

  /**
   * POST /security/gdpr/anonymize - Anonymize user data
   */
  @Post('gdpr/anonymize')
  @ApiOperation({ summary: 'Anonymize user data (alternative to deletion)' })
  @HttpCode(HttpStatus.OK)
  async anonymizeData(@CurrentUser('id') userId: string) {
    const result = await this.gdprService.anonymizeUserData(userId);
    return {
      success: true,
      message: result.message,
      data: { anonymizedAt: result.anonymizedAt },
    };
  }
}
