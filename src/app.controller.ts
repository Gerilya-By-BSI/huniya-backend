import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  index() {
    return {
      message: 'Huniya API',
      version: '1.0.0',
    };
  }
}
