import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  UseGuards,
  Res,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from '../services/auth.service';
import type { SafeUser } from '../services/auth.service';
import {
  RegisterDto,
  LoginDto,
  UpdateProfileDto,
  ChangePasswordDto,
} from '../dto/auth.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';

/**
 * Auth Controller - Handles authentication endpoints
 */
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * POST /auth/register - Register new user
   */
  @Post('register')
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.register(dto);

    // Set HTTP-only cookie
    this.setTokenCookie(res, result.accessToken);

    return {
      success: true,
      message: 'Registration successful',
      data: result,
    };
  }

  /**
   * POST /auth/login - Login user
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(dto);

    // Set HTTP-only cookie
    this.setTokenCookie(res, result.accessToken);

    return {
      success: true,
      message: 'Login successful',
      data: result,
    };
  }

  /**
   * POST /auth/logout - Logout user
   */
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@Res({ passthrough: true }) res: Response) {
    // Clear cookie
    res.clearCookie('access_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

    return {
      success: true,
      message: 'Logout successful',
    };
  }

  /**
   * GET /auth/me - Get current user profile
   */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  getProfile(@CurrentUser() user: SafeUser) {
    return {
      success: true,
      data: { user },
    };
  }

  /**
   * PATCH /auth/me - Update current user profile
   */
  @Patch('me')
  @UseGuards(JwtAuthGuard)
  async updateProfile(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateProfileDto,
  ) {
    const user = await this.authService.updateProfile(userId, dto);
    return {
      success: true,
      message: 'Profile updated successfully',
      data: { user },
    };
  }

  /**
   * POST /auth/change-password - Change user password
   */
  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @CurrentUser('id') userId: string,
    @Body() dto: ChangePasswordDto,
  ) {
    await this.authService.changePassword(userId, dto);
    return {
      success: true,
      message: 'Password changed successfully',
    };
  }

  /**
   * GET /auth/users - Get all users (for task assignment)
   */
  @Get('users')
  @UseGuards(JwtAuthGuard)
  async getAllUsers() {
    const users = await this.authService.getAllUsers();
    return {
      success: true,
      data: { users },
    };
  }

  /**
   * Set JWT token as HTTP-only cookie
   */
  private setTokenCookie(res: Response, token: string): void {
    res.cookie('access_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  }
}
