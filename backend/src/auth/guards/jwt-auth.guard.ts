import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * JWT Auth Guard - Protects routes that require authentication
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  override canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }
}
