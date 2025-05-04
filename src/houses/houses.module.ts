import { Module } from '@nestjs/common';
import { HousesService } from './houses.service';
import { HousesController } from './houses.controller';
import { HttpModule } from '@nestjs/axios';
import { PaginationModule } from '@/pagination/pagination.module';

@Module({
  imports: [HttpModule, PaginationModule],
  controllers: [HousesController],
  providers: [HousesService],
})
export class HousesModule {}
