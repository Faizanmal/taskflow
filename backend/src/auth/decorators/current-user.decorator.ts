import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { SafeUser } from '../services/auth.service';
import { Request } from 'express';

/**
 * CurrentUser Decorator - Extracts user from request
 * Usage: @CurrentUser() user: SafeUser
 */
export const CurrentUser = createParamDecorator(
  (data: keyof SafeUser | undefined, ctx: ExecutionContext): unknown => {
    const request = ctx
      .switchToHttp()
      .getRequest<Request & { user?: SafeUser }>();
    const user = request.user;

    if (data) {
      return user?.[data];
    }

    return user;
  },
);
