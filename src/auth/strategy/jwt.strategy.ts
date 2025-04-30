import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from '.';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    config: ConfigService,
    private readonly prismaService: PrismaService,
  ) {
    const secret = config.get<string>('ACCESS_TOKEN_SECRET');
    if (!secret) {
      throw new Error('ACCESS_TOKEN_SECRET is not defined');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: secret,
    });
  }

  async validate(payload: JwtPayload) {
    if (payload.user_type === 'user') {
      const user = await this.prismaService.user.findUnique({
        where: { id: payload.user_id },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }
    } else if (payload.user_type === 'admin') {
      const admin = await this.prismaService.admin.findUnique({
        where: { id: payload.user_id },
      });

      if (!admin) {
        throw new UnauthorizedException('Admin not found');
      }
    }

    return payload;
  }
}
