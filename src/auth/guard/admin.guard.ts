import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Role } from '@prisma/client';

export class AdminGuard implements CanActivate {
  canActivate(ctx: ExecutionContext) {
    const { user } = ctx.switchToHttp().getRequest();

    if (user.role != Role.ADMIN) {
      throw new ForbiddenException('Admin access required');
    }

    return true;
  }
}
