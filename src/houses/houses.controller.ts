import { Controller, Get, Body, Post, Query, UseGuards, Put, Param } from '@nestjs/common';
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
    });
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.housesService.findOne(id);
  }
  
  @Post('bookmarks')
  async createHouseBookmark(
    @Body() createHouseBookmarkDto: CreateHouseBookmarkDto,  // Ambil data dari body
    @User('user_id') user_id: string // Ambil user_id dari dekorator @User(), sesuai dengan implementasi autentikasi
  ) {
    console.log(user_id)
    return this.housesService.createHouseBookmark(createHouseBookmarkDto, user_id);
  }


  @Get('bookmarks')
  async getBookmarkedHouses(@User() user: any) {
    const { data, totalData } = await this.housesService.getBookmarkedHouses(user.id);

    if (!data || data.length === 0) {
      throw new NotFoundException('No bookmarked houses found');
    }

    return new BaseResponseDto(true, 'Bookmarked houses fetched successfully', {
      total_data: totalData,
      data,
    });
  }

  @Put('bookmarks/status')
  async updateTrackingStatus(
    @User() user: any,
    @Body() dto: HouseTrackingStatusDto
  ) {
    const result = await this.housesService.updateTrackingStatus(
      user.id,
      dto.house_id,
      dto.tracking_status_id
    );

    return new BaseResponseDto(true, 'Tracking status updated successfully', result);
  }

}
