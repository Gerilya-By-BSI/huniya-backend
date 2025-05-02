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
      min_price,
      max_price,
      room_count,
      bathroom_count,
      parking_count,
      min_land_area,
      max_land_area,
      min_building_area,
      max_building_area,
      search,
    } = dto;

    const where: Prisma.HouseWhereInput = {};

    if (location) {
      where.location = { contains: location, mode: 'insensitive' };
    }

    if (min_price && max_price) {
      where.price = {
        gte: Number(min_price),
        lte: Number(max_price),
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

    if (min_land_area && max_land_area) {
      where.land_area = {
        gte: Number(min_land_area),
        lte: Number(max_land_area),
      };
    }

    if (min_building_area && max_building_area) {
      where.building_area = {
        gte: Number(min_building_area),
        lte: Number(max_building_area),
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
