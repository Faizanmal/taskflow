import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService, JwtPayload, SafeUser } from '../services/auth.service';
import { Request } from 'express';

/**
 * JWT Strategy for Passport
 * Extracts JWT from Authorization header or cookies
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly authService: AuthService,
    configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        // First try Authorization header
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        // Then try cookies
        (request: Request) => {
          const token = request?.cookies?.access_token as string | undefined;
          return typeof token === 'string' ? token : null;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow('JWT_SECRET'),
    });
  }

  /**
   * Validate JWT payload and return user
   */
  async validate(payload: JwtPayload): Promise<SafeUser> {
    const user = await this.authService.validateUser(payload);
    if (!user) {
      throw new UnauthorizedException('Invalid token');
    }

    return user;
  }
}
