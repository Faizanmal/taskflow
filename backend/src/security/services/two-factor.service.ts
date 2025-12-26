import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';

/**
 * Two-Factor Authentication Service
 * Handles 2FA setup, verification, and management
 */
@Injectable()
export class TwoFactorService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Generate 2FA secret for user
   */
  async generateSecret(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    const secret = speakeasy.generateSecret({
      name: `TaskFlow (${user.email})`,
      issuer: 'TaskFlow',
    });

    // Generate QR code data URL
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url || '');

    return {
      secret: secret.base32,
      qrCode: qrCodeUrl,
      otpauthUrl: secret.otpauth_url,
    };
  }

  /**
   * Enable 2FA for user after verifying token
   */
  async enable2FA(userId: string, secret: string, token: string) {
    // Verify the token
    const isValid = speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 2,
    });

    if (!isValid) {
      throw new BadRequestException('Invalid verification code');
    }

    // Store the secret (in production, encrypt this)
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        // Note: You'll need to add these fields to your Prisma schema
        // twoFactorSecret: secret,
        // twoFactorEnabled: true,
      },
    });

    // Generate backup codes
    const backupCodes = this.generateBackupCodes();

    return {
      success: true,
      backupCodes,
    };
  }

  /**
   * Verify 2FA token
   */
  async verify2FA(userId: string, token: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Get the stored secret (add twoFactorSecret to schema)
    // const secret = user.twoFactorSecret;
    const secret = ''; // Placeholder

    if (!secret) {
      throw new BadRequestException('2FA not enabled');
    }

    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 2,
    });
  }

  /**
   * Disable 2FA for user
   */
  async disable2FA(userId: string, token: string) {
    const isValid = await this.verify2FA(userId, token);

    if (!isValid) {
      throw new BadRequestException('Invalid verification code');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        // twoFactorSecret: null,
        // twoFactorEnabled: false,
      },
    });

    return { success: true };
  }

  /**
   * Generate backup codes
   */
  private generateBackupCodes(): string[] {
    const codes: string[] = [];
    for (let i = 0; i < 10; i++) {
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      codes.push(`${code.slice(0, 4)}-${code.slice(4)}`);
    }
    return codes;
  }
}
