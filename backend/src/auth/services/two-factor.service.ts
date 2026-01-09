import { Injectable } from '@nestjs/common';
import * as speakeasy from 'speakeasy';

@Injectable()
export class TwoFactorService {
  generateSecret() {
    const secret = speakeasy.generateSecret({ name: 'TaskFlow' });
    return {
      secret: secret.base32,
      qrCode: 'placeholder-qr',
    };
  }

  verifyToken(secret: string, token: string) {
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 1,
    });
  }

  enable2FA() {
    // placeholder
    return { success: true, backupCodes: ['code1', 'code2'] };
  }

  disable2FA() {
    // placeholder
    return { success: true };
  }
}
