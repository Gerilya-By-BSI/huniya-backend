import { Controller, Get, Body, Param, Query, UseGuards } from '@nestjs/common';
import { HousesService } from './houses.service';
import { JwtGuard } from '@/auth/guard';
import { QueryHouseDto } from './dto/query-house.dto';
import { BaseResponseDto } from '@/common/dto/base-response.dto';
import { NotFoundException } from '@nestjs/common';


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
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.housesService.findOne(+id);
  }
}
