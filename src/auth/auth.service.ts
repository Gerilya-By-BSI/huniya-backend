import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginDto, RegisterDto } from './dto';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '@/prisma/prisma.service';
import { JwtPayload } from './strategy';
import * as argon from 'argon2';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
    private config: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const hash = await this.hashData(dto.password);

    const user = await this.prismaService.user.create({
      data: {
        ...dto,
        password: hash,
      },
    });

    if (!user) {
      throw new BadRequestException('Failed to create user');
    }

    return {
      name: user.name,
      phone_number: user.phone_number,
      email: user.email,
    };
  }

  async login(dto: LoginDto): Promise<{
    account_type: string;
    token: string;
  }> {
    const admin = await this.prismaService.admin.findUnique({
      where: { email: dto.email },
    });

    const user = !admin
      ? await this.prismaService.user.findUnique({
          where: { email: dto.email },
        })
      : null;

    if (!admin && !user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const account = admin || user;
    const accountType = admin ? 'admin' : 'user';

    const isPasswordValid = await this.verifyData(
      account!.password,
      dto.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const jwtPayload: JwtPayload = {
      user_id: account!.id,
      user_type: accountType,
    };

    const token = await this.signAccessToken(jwtPayload);

    return { account_type: accountType, token };
  }

  hashData(password: string) {
    return argon.hash(password);
  }

  verifyData(hash: string, data: string) {
    return argon.verify(hash, data);
  }

  async signAccessToken(payload: JwtPayload) {
    const secret = this.config.get<string>('ACCESS_TOKEN_SECRET');

    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: '1h',
      secret,
    });

    return accessToken;
  }
}
