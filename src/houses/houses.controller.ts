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
import { ParseIntPipe } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';

@UseGuards(JwtGuard)
@Controller('houses')
export class HousesController {
  constructor(
    private readonly housesService: HousesService,
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

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
    const house = await this.housesService.findOne(id);

    if (!house) {
      throw new NotFoundException('House not found');
    }

    const payload = {
      index: house.index,
    };

    const fastApiUrl = this.configService.get('FASTAPI_URL');
    const response = await firstValueFrom(
      this.httpService.post(`${fastApiUrl}/api/similar-houses/`, payload),
    );

    console.log('similar: ', response.data);

    const similarHouses = await this.housesService.findSimilarHouses(
      response.data.similar_houses,
    );

    return new BaseResponseDto(true, 'House fetched successfully', {
      house,
      similar_houses: similarHouses,
    });
  }
}
