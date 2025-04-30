import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { LoginDto, RegisterDto } from './dto';
import { AuthService } from './auth.service';
import { BaseResponseDto } from '../common/dto/base-response.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: RegisterDto): Promise<BaseResponseDto<any>> {
    const result = await this.authService.register(dto);
    return BaseResponseDto.success(result, 'User registered successfully');
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto): Promise<BaseResponseDto<any>> {
    const result = await this.authService.login(dto);
    return BaseResponseDto.success(result, 'Login successful');
  }
}
