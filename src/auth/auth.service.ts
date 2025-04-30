import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ForgotPasswordDto,
  LoginDto,
  RegisterDto,
  ResetPasswordDto,
} from './dto';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '@/prisma/prisma.service';
import { Role, Status } from '@prisma/client';
import { promisify } from 'util';
import { join } from 'path';
import { JwtPayload } from './strategy';
import argon from 'argon2';
import nodemailer, { Transporter } from 'nodemailer';
import fs from 'fs';

@Injectable()
export class AuthService {
  private readonly transporter: Transporter;

  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
    private config: ConfigService,
  ) {
    this.transporter = nodemailer.createTransport({
      host: this.config.get<string>('MAIL_HOST'),
      port: this.config.get<number>('MAIL_PORT'),
      auth: {
        user: this.config.get<string>('MAIL_USER'),
        pass: this.config.get<string>('MAIL_PASSWORD'),
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
  }

  async register(dto: RegisterDto) {
    const hash = await this.hashData(dto.password);

    const user = await this.prismaService.user.create({
      data: {
        ...dto,
        password: hash,
        role: Role.INVESTOR,
        status: Status.ACTIVE,
      },
    });

    delete user.password;

    return user;
  }

  async login(dto: LoginDto): Promise<{
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    role: Role;
    access_token: string;
    refresh_token: string;
  }> {
    const user = await this.prismaService.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.status === Status.INACTIVE) {
      throw new UnauthorizedException(
        'Account deactivated. Please contact admin',
      );
    }

    const isPasswordValid = await this.verifyData(user.password, dto.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const [access_token, refresh_token] = await Promise.all([
      this.signAccessToken(user.id, user.email, user.role),
      this.signRefreshToken(user.id, user.email, user.role),
    ]);

    await this.prismaService.user.update({
      where: { id: user.id },
      data: { refresh_token },
    });

    return {
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      role: user.role,
      access_token,
      refresh_token,
    };
  }

  async refreshToken(refresh_token: string): Promise<{ access_token: string }> {
    try {
      await this.jwtService.verifyAsync(refresh_token, {
        secret: this.config.get<string>('REFRESH_TOKEN_SECRET'),
      });

      const user = await this.prismaService.user.findFirstOrThrow({
        where: { refresh_token },
      });

      const newAccessToken = await this.signAccessToken(
        user.id,
        user.email,
        user.role,
      );

      return { access_token: newAccessToken };
    } catch (error) {
      if (
        error.name === 'JsonWebTokenError' ||
        error.name === 'TokenExpiredError'
      ) {
        throw new UnauthorizedException('Token invalid or expired');
      }

      throw error;
    }
  }

  async logout(user_id: string) {
    await this.prismaService.user.updateMany({
      where: {
        id: user_id,
        refresh_token: {
          not: null,
        },
      },
      data: {
        refresh_token: null,
      },
    });

    return {
      status: 'success',
      message: 'Account logged out successfully',
    };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.prismaService.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const resetToken = await this.signResetToken(user.id, user.email);

    await this.prismaService.passwordResets.create({
      data: { email: user.email, token: resetToken },
    });

    const messageId = await this.sendForgotPasswordEmail(
      user.email,
      resetToken,
    );

    if (!messageId) {
      throw new HttpException(
        'Unable to send reset password email',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return {
      message: 'Reset password email sent',
      info_id: messageId,
      reset_token: resetToken,
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    try {
      await this.jwtService.verifyAsync(dto.token, {
        secret: this.config.get<string>('RESET_TOKEN_SECRET'),
      });

      const decoded = this.jwtService.decode(dto.token) as JwtPayload;

      const passwordReset = await this.prismaService.passwordResets.count({
        where: { email: decoded.email },
      });

      if (!passwordReset) {
        throw new UnauthorizedException('Token already used');
      }

      const hash = await this.hashData(dto.new_password);

      await this.prismaService.user.update({
        where: { id: decoded.user_id },
        data: { password: hash },
      });

      await this.prismaService.passwordResets.deleteMany({
        where: { email: decoded.email },
      });

      return {
        status: 'success',
        message: 'Password changed successfully',
      };
    } catch (error) {
      if (
        error.name === 'JsonWebTokenError' ||
        error.name === 'TokenExpiredError'
      ) {
        throw new UnauthorizedException('Token invalid or expired');
      }

      throw error;
    }
  }

  async sendForgotPasswordEmail(email: string, resetToken: string) {
    const clientDomain = this.config.get<string>('CLIENT_DOMAIN');

    const resetUrl = `${clientDomain}/auth/reset-password?token=${resetToken}`;

    let htmlContent = await this.readHtmlFile('forgot-password.html');

    htmlContent = htmlContent.replace('{{resetUrl}}', resetUrl);

    const mailOptions: nodemailer.SendMailOptions = {
      from: 'no-reply@indigo-data-engine.tech',
      to: email,
      subject: 'Reset Password - Indigo Data Engine',
      html: htmlContent,
    };

    const { messageId }: { messageId: string } =
      await this.transporter.sendMail(mailOptions);

    return messageId;
  }

  readHtmlFile(fileName: string) {
    const readFile = promisify(fs.readFile);
    return readFile(join(__dirname, `../../assets/${fileName}`), 'utf8');
  }

  hashData(password: string) {
    return argon.hash(password);
  }

  verifyData(hash: string, data: string) {
    return argon.verify(hash, data);
  }

  async signResetToken(user_id: string, email: string) {
    const payload = { user_id, email };

    const secret = this.config.get<string>('RESET_TOKEN_SECRET');

    const resetToken = await this.jwtService.signAsync(payload, {
      expiresIn: '15m',
      secret,
    });

    return resetToken;
  }

  async signAccessToken(user_id: string, email: string, role: Role) {
    const payload = { user_id, email, role };

    const secret = this.config.get<string>('ACCESS_TOKEN_SECRET');

    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: '15m',
      secret,
    });

    return accessToken;
  }

  async signRefreshToken(user_id: string, email: string, role: Role) {
    const payload = { user_id, email, role };

    const secret = this.config.get<string>('REFRESH_TOKEN_SECRET');

    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: '1w',
      secret,
    });

    return refreshToken;
  }
}
