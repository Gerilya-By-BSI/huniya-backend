import { Injectable } from '@nestjs/common';
import { CreateHouseDto } from './dto/create-house.dto';
import { UpdateHouseDto } from './dto/update-house.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { QueryHouseDto } from './dto/query-house.dto';

import { Prisma } from '@prisma/client';

@Injectable()
export class HousesService {
  constructor(private readonly prismaService: PrismaService) {}

  // create(createHouseDto: CreateHouseDto) {
  //   return this.prismaService.house.create({
  //     data: createHouseDto,
  //   });
  // }

  findOne(id: number) {
    return this.prismaService.house.findUnique({
      where: {
        id: id,
      },
    });
  }

  update(id: number, updateHouseDto: UpdateHouseDto) {
    return this.prismaService.house.update({
      where: { id },
      data: updateHouseDto,
    });
  }

  remove(id: number) {
    return this.prismaService.house.delete({
      where: { id },
    });
  }

  async findAll(dto: QueryHouseDto) {
    const {
      location,
      minPrice,
      maxPrice,
      room_count,
      bathroom_count,
      parking_count,
      minLandArea,
      maxLandArea,
      minBuildingArea,
      maxBuildingArea,
      search,
    } = dto;
  
    const where: Prisma.HouseWhereInput = {};
  
    if (location) {
      where.location = { contains: location, mode: 'insensitive' };
    }
  
    if (minPrice && maxPrice) {
      where.price = {
        gte: Number(minPrice),
        lte: Number(maxPrice),
      };
    }
  
    if (room_count) {
      where.room_count = Number(room_count);
    }
  
    if (bathroom_count) {
      where.bathroom_count = Number(bathroom_count);
    }
  
    if (parking_count) {
      where.parking_count = Number(parking_count);
    }
  
    if (minLandArea && maxLandArea) {
      where.land_area = {
        gte: Number(minLandArea),
        lte: Number(maxLandArea),
      };
    }
  
    if (minBuildingArea && maxBuildingArea) {
      where.building_area = {
        gte: Number(minBuildingArea),
        lte: Number(maxBuildingArea),
      };
    }
  
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
      ];
    }
  
    const data = await this.prismaService.house.findMany({
      where,
      select: {
        title: true,
        price: true,
        location: true,
        land_area: true,
        building_area: true,
        image_url: true,
      },
    });
  
    const totalData = await this.prismaService.house.count({
      where,
    });
  
    return {
      totalData,
      data,
    };
  }
  
}
