import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { PaginationModule } from '@/pagination/pagination.module';

@Module({
  imports: [PaginationModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
