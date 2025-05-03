import {
  Controller,
  Get,
  Body,
  Post,
  Query,
  UseGuards,
  Put,
  Param,
} from '@nestjs/common';
import { HousesService } from './houses.service';
import { JwtGuard } from '@/auth/guard';
import { QueryHouseDto } from './dto/query-house.dto';
import { BaseResponseDto } from '@/common/dto/base-response.dto';
import { NotFoundException } from '@nestjs/common';
import { User } from '@/auth/decorator/user.decorator';
import { HouseTrackingStatusDto } from './dto/update-tracking-status.dto'; // Pastikan path-nya sesuai
import { CreateHouseBookmarkDto } from './dto/create-house-bookmark.dto';
// import { House } from 'generated/prisma';
import { ParseIntPipe } from '@nestjs/common';

@UseGuards(JwtGuard)
@Controller('houses')
export class HousesController {
  constructor(private readonly housesService: HousesService) {}

  @Get()
  async findAll(@Query() query: QueryHouseDto) {
    const { data, totalData } = await this.housesService.findAll(query);

    if (!data || data.length === 0) {
      throw new NotFoundException('No houses found');
    }

    return new BaseResponseDto(true, 'Houses fetched successfully', {
      total_data: totalData,
      data,
      total_pages: Math.ceil(totalData / query.limit), // Total halaman berdasarkan totalData dan limit
      current_page: query.page, // Halaman saat ini
    });
  }
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.housesService.findOne(id);
  }
}
