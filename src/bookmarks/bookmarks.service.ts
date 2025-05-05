import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateHouseBookmarkDto } from '@/houses/dto/create-house-bookmark.dto';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

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

    // Buat bookmark baru sekaligus ambil relasi tracking_status
    const newBookmark = await this.prismaService.houseBookmark.create({
      data: {
        house_id,
        tracking_status_id,
        user_id,
      },
      include: {
        tracking_status: true,
      },
    });

    // Fungsi bantu ubah nama jadi Title Case
    const toTitleCase = (value: string): string => {
      return value
        .toLowerCase()
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    };

    const trackingStatusTitleCase = newBookmark.tracking_status
      ? toTitleCase(newBookmark.tracking_status.name)
      : null;

    return {
      message: 'Bookmark created successfully',
      data: {
        ...newBookmark,
        tracking_status: trackingStatusTitleCase,
      },
    };
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

    const toTitleCase = (value: string): string => {
      return value
        .toLowerCase()
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    };

    const data = bookmarks.map((bookmark) => ({
      ...bookmark.house,
      tracking_status: bookmark.tracking_status
        ? {
            id: bookmark.tracking_status.id,
            name: toTitleCase(bookmark.tracking_status.name),
          }
        : null,
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

    // Fungsi bantu ubah nama
    const toTitleCase = (value: string): string => {
      return value
        .toLowerCase()
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    };

    const formattedStatuses = statuses.map((status) => ({
      id: status.id,
      name: toTitleCase(status.name),
    }));

    return formattedStatuses;
  }

  async getBookmarkDetail(userId: string, houseId: number) {
    const bookmark = await this.prismaService.houseBookmark.findFirst({
      where: {
        user_id: userId,
        house_id: houseId,
      },
      include: {
        house: true,
        tracking_status: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone_number: true,
          },
        },
      },
    });

    if (!bookmark) {
      throw new NotFoundException('Bookmark not found for this user and house');
    }

    const toTitleCase = (value: string): string => {
      return value
        .toLowerCase()
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    };

    return {
      house: bookmark.house,
      tracking_status: {
        id: bookmark.tracking_status.id,
        name: toTitleCase(bookmark.tracking_status.name),
      },
      user: bookmark.user,
    };
  }

  async getTracker(userId: string) {
    const bookmarks = await this.prismaService.houseBookmark.findMany({
      where: {
        tracking_status_id: 5, // Accepted
        user_id: userId, // Hanya data dari user yang login
      },
      include: {
        house: true,
        tracking_status: true,
        user: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!bookmarks || bookmarks.length === 0) {
      throw new NotFoundException('No accepted bookmarks found for this user');
    }

    function formatDate(date: Date): string {
      return format(date, 'EEEE, dd MMMM yyyy, HH:mm', { locale: id });
    }

    function toTitleCase(value: string): string {
      return value
        .toLowerCase()
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }

    return bookmarks.map((b) => ({
      house: {
        ...b.house,
        created_at: formatDate(b.house.created_at),
        updated_at: formatDate(b.house.updated_at),
      },
      tracking_status: {
        id: b.tracking_status.id,
        name: toTitleCase(b.tracking_status.name),
      },
      user: {
        name: b.user.name,
      },
    }));
  }
}
