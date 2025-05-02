import { Injectable } from '@nestjs/common';
import { CreateHouseDto } from './dto/create-house.dto';
import { UpdateHouseDto } from './dto/update-house.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { QueryHouseDto } from './dto/query-house.dto';
import { NotFoundException, ConflictException} from '@nestjs/common';


import { Prisma } from '@prisma/client';
import { CreateHouseBookmarkDto } from './dto/create-house-bookmark.dto';

@Injectable()
export class HousesService {
  constructor(private readonly prismaService: PrismaService) {}
  

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
        id:true,
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

  async findOne(id: number) {
    try {
      const house = await this.prismaService.house.findUnique({
        where: {
          id, 
        },
        select: {
          id: true,
          title: true,
          price: true,
          location: true,
          room_count: true,
          bathroom_count: true,
          parking_count: true,
          land_area: true,
          building_area: true,
          is_sold: true,
          image_url: true,
          created_at: true,
          updated_at: true,
        },
      });

      if (!house) {
        throw new Error('House not found');
      }

      return house;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async createHouseBookmark(
    createHouseBookmarkDto: CreateHouseBookmarkDto,
    user_id: string,
  ) {
    const { house_id, tracking_status_id } = createHouseBookmarkDto;
  
    const house = await this.prismaService.house.findUnique({
      where: { id: house_id },
    });
  
    if (!house) {
      throw new Error('House not found');
    }
  
    const existingBookmark = await this.prismaService.houseBookmark.findFirst({
      where: {
        house_id,
        user_id,  
      },
    });
  
    if (existingBookmark) {
      throw new Error('Bookmark already added');
    }
  
    const newBookmark = await this.prismaService.houseBookmark.create({
      data: {
        house_id,
        tracking_status_id,
        user_id,
      },
    });
  
    return newBookmark;
  }
  

  async getBookmarkedHouses(userId: string) {
    const bookmarks = await this.prismaService.houseBookmark.findMany({
      where: {
        user_id: userId,
      },
      include: {
        house: {
          select: {
            id: true,
            title: true,
            price: true,
            location: true,
            land_area: true,
            building_area: true,
            image_url: true,
          },
        },
        tracking_status: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  
    const data = bookmarks.map((bookmark) => ({
      ...bookmark.house,
      tracking_status: bookmark.tracking_status,
    }));
  
    return {
      totalData: data.length,
      data,
    };
  }

  async updateTrackingStatus(userId: string, houseId: number, trackingStatusId: number) {
    const updated = await this.prismaService.houseBookmark.updateMany({
      where: {
        user_id: userId,
        house_id: houseId,
      },
      data: {
        tracking_status_id: trackingStatusId,
      },
    });
  
    if (updated.count === 0) {
      throw new NotFoundException('Bookmark not found');
    }
  
    return {
      user_id: userId,
      house_id: houseId,
      tracking_status_id: trackingStatusId,
    };
  }
  
  
}
