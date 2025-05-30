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
    const data = await this.housesService.findAll(query);

    return new BaseResponseDto(true, 'Houses fetched successfully', data);
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

    const similarHouses = await this.housesService.findSimilarHouses(
      response.data.similar_houses,
    );

    return new BaseResponseDto(true, 'House fetched successfully', {
      house,
      similar_houses: similarHouses,
    });
  }
}
