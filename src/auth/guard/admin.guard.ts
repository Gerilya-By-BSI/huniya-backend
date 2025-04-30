import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';

export class AdminGuard implements CanActivate {
  canActivate(ctx: ExecutionContext): boolean {
    const { user } = ctx.switchToHttp().getRequest();

    if (!user || user.user_type !== 'admin') {
      throw new ForbiddenException('Admin access required');
    }

    return true;
  }
}
