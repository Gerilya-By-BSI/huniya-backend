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
      include: {
        admin: {
          select: {
            name: true,
            branch: {
              select: {
                name: true,
              },
            },
          },
        },
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

  // async findAll(filters) {
  //   try {
  //     const priceFilter: any = {};
  //     if (filters.minPrice && !isNaN(Number(filters.minPrice))) {
  //       priceFilter.gte = Number(filters.minPrice);
  //     }
  //     if (filters.maxPrice && !isNaN(Number(filters.maxPrice))) {
  //       priceFilter.lte = Number(filters.maxPrice);
  //     }

  //     const landAreaFilter: any = {};
  //     if (filters.minLandArea && !isNaN(Number(filters.minLandArea))) {
  //       landAreaFilter.gte = Number(filters.minLandArea);
  //     }
  //     if (filters.maxLandArea && !isNaN(Number(filters.maxLandArea))) {
  //       landAreaFilter.lte = Number(filters.maxLandArea);
  //     }

  //     const buildingAreaFilter: any = {};
  //     if (filters.minBuildingArea && !isNaN(Number(filters.minBuildingArea))) {
  //       buildingAreaFilter.gte = Number(filters.minBuildingArea);
  //     }
  //     if (filters.maxBuildingArea && !isNaN(Number(filters.maxBuildingArea))) {
  //       buildingAreaFilter.lte = Number(filters.maxBuildingArea);
  //     }

  //     const where: any = {
  //       ...(filters.search && {
  //         OR: [
  //           { title: { contains: filters.search, mode: 'insensitive' } },
  //           { location: { contains: filters.search, mode: 'insensitive' } },
  //         ],
  //       }),
  //       ...(Object.keys(priceFilter).length > 0 && { price: priceFilter }),
  //       ...(filters.rooms && !isNaN(Number(filters.rooms)) && {
  //         room_count: Number(filters.rooms),
  //       }),
  //       ...(filters.bathrooms && !isNaN(Number(filters.bathrooms)) && {
  //         bathroom_count: Number(filters.bathrooms),
  //       }),
  //       ...(filters.parking && !isNaN(Number(filters.parking)) && {
  //         parking_count: Number(filters.parking),
  //       }),
  //       ...(Object.keys(landAreaFilter).length > 0 && {
  //         land_area: landAreaFilter,
  //       }),
  //       ...(Object.keys(buildingAreaFilter).length > 0 && {
  //         building_area: buildingAreaFilter,
  //       }),
  //     };

  //     const data = await this.prismaService.house.findMany({ where });
  //     const totalData = await this.prismaService.house.count({ where });

  //     return {
  //       success: true,
  //       message: 'Success',
  //       totalData,
  //       data,
  //     };
  //   } catch (error) {
  //     return {
  //       success: false,
  //       message: `Failed to fetch houses: ${error.message}`,
  //       data: [],
  //     };
  //   }
  // }
}
