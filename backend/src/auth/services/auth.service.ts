import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UserRepository } from '../repositories/user.repository';
import {
  RegisterDto,
  LoginDto,
  UpdateProfileDto,
  ChangePasswordDto,
} from '../dto/auth.dto';
import { User } from '@prisma/client';

/**
 * JWT Payload interface
 */
export interface JwtPayload {
  sub: string;
  email: string;
}

/**
 * User response without password
 */
export type SafeUser = Omit<User, 'password'>;

/**
 * Auth Service - Business logic for authentication
 */
@Injectable()
export class AuthService {
  private readonly SALT_ROUNDS = 12;

  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Register a new user
   */
  async register(
    dto: RegisterDto,
  ): Promise<{ user: SafeUser; accessToken: string }> {
    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(dto.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(dto.password, this.SALT_ROUNDS);

    // Create user
    const user = await this.userRepository.create({
      email: dto.email,
      password: hashedPassword,
      name: dto.name,
    });

    // Generate token
    const accessToken = this.generateToken(user);

    return {
      user: this.sanitizeUser(user),
      accessToken,
    };
  }

  /**
   * Login user
   */
  async login(dto: LoginDto): Promise<{ user: SafeUser; accessToken: string }> {
    const user = await this.userRepository.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const accessToken = this.generateToken(user);

    return {
      user: this.sanitizeUser(user),
      accessToken,
    };
  }

  /**
   * Get user profile by ID
   */
  async getProfile(userId: string): Promise<SafeUser> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return this.sanitizeUser(user);
  }

  /**
   * Update user profile
   */
  async updateProfile(
    userId: string,
    dto: UpdateProfileDto,
  ): Promise<SafeUser> {
    const user = await this.userRepository.update(userId, dto);
    return this.sanitizeUser(user);
  }

  /**
   * Change user password
   */
  async changePassword(userId: string, dto: ChangePasswordDto): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(
      dto.currentPassword,
      user.password,
    );
    if (!isPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    const hashedPassword = await bcrypt.hash(dto.newPassword, this.SALT_ROUNDS);
    await this.userRepository.update(userId, { password: hashedPassword });
  }

  /**
   * Validate user from JWT payload
   */
  async validateUser(payload: JwtPayload): Promise<SafeUser | null> {
    const user = await this.userRepository.findById(payload.sub);
    return user ? this.sanitizeUser(user) : null;
  }

  /**
   * Get all users (for task assignment)
   */
  async getAllUsers(): Promise<
    Pick<User, 'id' | 'email' | 'name' | 'avatar'>[]
  > {
    return this.userRepository.findAll();
  }

  /**
   * Generate JWT token
   */
  private generateToken(user: User): string {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
    };
    return this.jwtService.sign(payload);
  }

  /**
   * Remove password from user object
   */
  private sanitizeUser(user: User): SafeUser {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...safeUser } = user;
    return safeUser;
  }
}
