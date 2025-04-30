import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { JwtPayload } from '../strategy';

export class AdminGuard implements CanActivate {
  canActivate(ctx: ExecutionContext): boolean {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as JwtPayload;

    if (!user || user.user_type !== 'admin') {
      throw new ForbiddenException('Admin access required');
    }

    return true;
  }
}
