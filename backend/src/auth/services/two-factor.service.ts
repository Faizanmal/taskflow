import { Injectable } from '@nestjs/common';
import * as speakeasy from 'speakeasy';

@Injectable()
export class TwoFactorService {
  async generateSecret(_userId: string) {
    const secret = speakeasy.generateSecret({ name: 'TaskFlow' });
    return {
      secret: secret.base32,
      qrCode: 'placeholder-qr',
    };
  }

  async verifyToken(secret: string, token: string) {
    return speakeasy.totp.verify({ secret, encoding: 'base32', token, window: 1 });
  }

  async enable2FA(_userId: string, _secret: string, _token: string) {
    // placeholder
    return { success: true, backupCodes: ['code1', 'code2'] };
  }

  async disable2FA(_userId: string) {
    // placeholder
    return { success: true };
  }
}