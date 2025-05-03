import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateHouseBookmarkDto } from '@/houses/dto/create-house-bookmark.dto';

@Injectable()
export class BookmarksService {
  constructor(private readonly prismaService: PrismaService) {}

  async createHouseBookmark(
    createHouseBookmarkDto: CreateHouseBookmarkDto,
    user_id: string,
  ) {
    const { house_id, tracking_status_id } = createHouseBookmarkDto;

    const house = await this.prismaService.house.findUnique({
      where: { id: house_id },
    });

    if (!house) {
      throw new BadRequestException('House not found');
    }

    const existingBookmark = await this.prismaService.houseBookmark.findFirst({
      where: {
        house_id,
        user_id,
      },
    });

    if (existingBookmark) {
      throw new BadRequestException('Bookmark already added');
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
            room_count: true,
            bathroom_count: true,
            parking_count: true,
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

  async getTrackingStatuses() {
    const statuses = await this.prismaService.trackingStatus.findMany();
  
    if (!statuses || statuses.length === 0) {
      throw new NotFoundException('No tracking statuses found');
    }
  
    return statuses;
  }

  async updateTrackingStatus(
    userId: string,
    houseId: number,
    trackingStatusId: number,
  ) {
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
