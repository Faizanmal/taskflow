import { Test, TestingModule } from '@nestjs/testing';
import { TwoFactorService } from '../src/auth/services/two-factor.service';
import { PrismaService } from '../src/prisma/prisma.service';
import * as speakeasy from 'speakeasy';

jest.mock('speakeasy');
jest.mock('qrcode');

describe('TwoFactorService', () => {
  let service: TwoFactorService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TwoFactorService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<TwoFactorService>(TwoFactorService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateSecret', () => {
    it('should generate a new TOTP secret', async () => {
      const userId = 'user-1';
      
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: userId,
        email: 'test@example.com',
      });

      (speakeasy.generateSecret as jest.Mock).mockReturnValue({
        base32: 'JBSWY3DPEHPK3PXP',
        otpauth_url: 'otpauth://totp/TaskFlow:test@example.com?secret=JBSWY3DPEHPK3PXP',
      });

      const result = await service.generateSecret(userId);

      expect(result).toHaveProperty('secret');
      expect(result).toHaveProperty('qrCode');
      expect(speakeasy.generateSecret).toHaveBeenCalled();
    });
  });

  describe('verifyToken', () => {
    it('should verify a valid TOTP token', async () => {
      const secret = 'JBSWY3DPEHPK3PXP';
      const token = '123456';

      (speakeasy.totp.verify as jest.Mock).mockReturnValue(true);

      const result = await service.verifyToken(secret, token);

      expect(result).toBe(true);
      expect(speakeasy.totp.verify).toHaveBeenCalledWith({
        secret,
        encoding: 'base32',
        token,
        window: 1,
      });
    });

    it('should reject an invalid TOTP token', async () => {
      (speakeasy.totp.verify as jest.Mock).mockReturnValue(false);

      const result = await service.verifyToken('secret', 'wrong');

      expect(result).toBe(false);
    });
  });

  describe('enable2FA', () => {
    it('should enable 2FA and return backup codes', async () => {
      const userId = 'user-1';
      const secret = 'JBSWY3DPEHPK3PXP';
      const token = '123456';

      (speakeasy.totp.verify as jest.Mock).mockReturnValue(true);
      mockPrismaService.user.update.mockResolvedValue({ id: userId });

      const result = await service.enable2FA(userId, secret, token);

      expect(result).toHaveProperty('backupCodes');
      expect(result.backupCodes).toHaveLength(10);
      expect(mockPrismaService.user.update).toHaveBeenCalled();
    });

    it('should throw error for invalid token', async () => {
      (speakeasy.totp.verify as jest.Mock).mockReturnValue(false);

      await expect(
        service.enable2FA('user-1', 'secret', 'wrong')
      ).rejects.toThrow();
    });
  });
});
