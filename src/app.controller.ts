import { Controller, Get, UseGuards } from '@nestjs/common';
import { AdminGuard, JwtGuard } from './auth/guard';

@Controller('/api')
export class AppController {
  @Get()
  index() {
    return {
      message: 'Huniya API',
      version: '1.0.0',
    };
  }

  @UseGuards(JwtGuard)
  @Get('/protected')
  protected() {
    return {
      message: 'Huniya API Protected',
      version: '1.0.0',
    };
  }

  @UseGuards(JwtGuard, AdminGuard)
  @Get('/admin')
  admin() {
    return {
      message: 'Huniya API Admin Check',
      version: '1.0.0',
    };
  }
}
