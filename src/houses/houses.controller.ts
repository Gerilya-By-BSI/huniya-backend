import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Request, UseGuards } from '@nestjs/common';
import { HousesService } from './houses.service';
import { CreateHouseDto } from './dto/create-house.dto';
import { UpdateHouseDto } from './dto/update-house.dto';
import { JwtGuard } from '@/auth/guard';
import { JwtService } from '@nestjs/jwt';

@UseGuards(JwtGuard)
@Controller('houses')
export class HousesController {
  constructor(
    private readonly housesService: HousesService,
  ) {}

  // @Post()
  // create(@Body() createHouseDto: CreateHouseDto) {
  //   return this.housesService.create(createHouseDto);
  // }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.housesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateHouseDto: UpdateHouseDto) {
    return this.housesService.update(+id, updateHouseDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.housesService.remove(+id);
  }

  @Get()
  async findAll(@Query() query: any, @Request() req) {
    try {
      // // Decode token to extract adminId (or use whatever method you have to get it)
      // const adminId = this.jwtService.decode(req.headers.authorization.split(' ')[1]).sub;

      // console.log('Received query parameters:', query);  // Log query parameters
      const response = await this.housesService.findAll(query);

      if (!response.data || response.data.length === 0) {
        // Return 404 if no data is found
        return {
          statusCode: 404,
          success: false,
          message: 'No houses found',
          data: [],
        };
      }

      // Return 200 if data exists
      return {
        statusCode: 200,
        success: true,
        message: 'Houses retrieved successfully',
        totalData: response.totalData,
        data: response.data,
      };
    } catch (error) {
      console.error('Error:', error);
      return {
        statusCode: 500,
        success: false,
        message: 'Internal server error',
        error: error.message || 'Unknown error',
      };
    }
  }
}
