import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateHouseDto } from './dto/update-house.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { QueryHouseDto } from './dto/query-house.dto';
import { House, Prisma } from '@prisma/client';
import { PaginationService } from '@/pagination/pagination.service';

@Injectable()
export class HousesService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly paginationService: PaginationService<House>,
  ) {}

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

    const total = await this.prismaService.house.count({
      where,
    });

    if (total === 0) {
      throw new NotFoundException('No houses found');
    }

    const limit = this.paginationService.validateLimit(dto.limit) || 10;
    const page =
      this.paginationService.validatePage(dto.page, total, limit) || 1;

    const data = await this.prismaService.house.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
    });

    return this.paginationService.paginate(data, total, page, limit);

    // const skip = (page - 1) * limit;
    // const data = await this.prismaService.house.findMany({
    //   where,
    //   skip,
    //   take: limit,
    //   select: {
    //     id: true,
    //     title: true,
    //     price: true,
    //     location: true,
    //     land_area: true,
    //     building_area: true,
    //     room_count: true,
    //     bathroom_count: true,
    //     parking_count: true,
    //     image_url: true,
    //   },
    // });

    // const totalData = await this.prismaService.house.count({
    //   where,
    // });

    // return {
    //   totalData,
    //   data,
    //   totalPages: Math.ceil(totalData / limit),
    //   currentPage: page,
    // };
  }

  async findOne(id: number) {
    try {
      const house = await this.prismaService.house.findUniqueOrThrow({
        where: {
          id,
        },
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

      return house;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async findSimilarHouses(indexes: number[]) {
    try {
      const houses = await this.prismaService.house.findMany({
        where: {
          index: {
            in: indexes,
          },
        },
        select: {
          id: true,
          title: true,
          price: true,
          location: true,
          land_area: true,
          building_area: true,
          room_count: true,
          bathroom_count: true,
          parking_count: true,
          image_url: true,
          index: true,
        },
      });

      return houses;
    } catch (error) {
      throw new Error(error.message);
    }
  }
}
