import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../src/auth/services/auth.service';
import { UserRepository } from '../src/auth/repositories/user.repository';

/* eslint-disable @typescript-eslint/unbound-method */

// Mock bcrypt
jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let authService: AuthService;
  let userRepository: jest.Mocked<UserRepository>;

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    password: 'hashedPassword123',
    name: 'Test User',
    avatar: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const mockUserRepository = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      findAll: jest.fn(),
    };

    const mockJwtService = {
      sign: jest.fn().mockReturnValue('mock-jwt-token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserRepository, useValue: mockUserRepository },

        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userRepository = module.get(UserRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    const registerDto = {
      email: 'newuser@example.com',
      password: 'password123',
      name: 'New User',
    };

    it('should successfully register a new user', async () => {
      // Arrange
      userRepository.findByEmail.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      userRepository.create.mockResolvedValue({
        ...mockUser,
        email: registerDto.email,
        name: registerDto.name,
      });

      // Act
      const result = await authService.register(registerDto);

      // Assert
      expect(userRepository.findByEmail).toHaveBeenCalledWith(
        registerDto.email,
      );
      expect(bcrypt.hash).toHaveBeenCalledWith(registerDto.password, 12);
      expect(userRepository.create).toHaveBeenCalledWith({
        email: registerDto.email,
        password: 'hashedPassword',
        name: registerDto.name,
      });
      expect(result).toHaveProperty('accessToken', 'mock-jwt-token');
      expect(result.user).not.toHaveProperty('password');
    });

    it('should throw ConflictException if user already exists', async () => {
      // Arrange
      userRepository.findByEmail.mockResolvedValue(mockUser);

      // Act & Assert
      await expect(authService.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
      expect(userRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    const loginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should successfully login with valid credentials', async () => {
      // Arrange
      userRepository.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      // Act
      const result = await authService.login(loginDto);

      // Assert
      expect(userRepository.findByEmail).toHaveBeenCalledWith(loginDto.email);
      expect(bcrypt.compare).toHaveBeenCalledWith(
        loginDto.password,
        mockUser.password,
      );
      expect(result).toHaveProperty('accessToken', 'mock-jwt-token');
      expect(result.user).not.toHaveProperty('password');
    });

    it('should throw UnauthorizedException if user not found', async () => {
      // Arrange
      userRepository.findByEmail.mockResolvedValue(null);

      // Act & Assert
      await expect(authService.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      // Arrange
      userRepository.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      // Act & Assert
      await expect(authService.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('validateUser', () => {
    it('should return sanitized user if found', async () => {
      // Arrange
      userRepository.findById.mockResolvedValue(mockUser);

      // Act
      const result = await authService.validateUser({
        sub: mockUser.id,
        email: mockUser.email,
      });

      // Assert
      expect(result).not.toBeNull();
      expect(result).not.toHaveProperty('password');
      expect(result?.email).toBe(mockUser.email);
    });

    it('should return null if user not found', async () => {
      // Arrange
      userRepository.findById.mockResolvedValue(null);

      // Act
      const result = await authService.validateUser({
        sub: 'non-existent',
        email: 'none@example.com',
      });

      // Assert
      expect(result).toBeNull();
    });
  });
});
