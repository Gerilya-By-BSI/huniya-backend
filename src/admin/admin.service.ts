import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { UpdateTrackingStatusDto } from './dto/update-tracking-status.dto';
import { format } from 'date-fns'; // Jika Anda menggunakan date-fns, atau bisa gunakan moment.js
import { id } from 'date-fns/locale';
import { PaginationService } from '@/pagination/pagination.service';
import { HouseBookmark } from '@prisma/client';
import { QueryBookmarkHouseDto } from './dto/query-bookmark-house.dto';

@Injectable()
export class AdminService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly paginationService: PaginationService<any>,
  ) {}

  async getFinancingUsers(adminId: string, dto: QueryBookmarkHouseDto) {
    const where = {
      house: {
        admin_id: adminId, // Filter by admin_id from JWT
      },
    };

    const total = await this.prismaService.houseBookmark.count({
      where,
    });

    const limit = this.paginationService.validateLimit(dto.limit) || 10;
    const page =
      this.paginationService.validatePage(dto.page, total, limit) || 1;

    const houseBookmarks = await this.prismaService.houseBookmark.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        created_at: 'desc',
      },
      select: {
        tracking_status: true,
        created_at: true,
        updated_at: true,
        house: {
          select: {
            id: true,
            title: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            phone_number: true,
            email: true,
            profile_risk: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    const formatDate = (date: Date) => {
      return format(date, 'eeee dd MMMM yyyy HH:mm', { locale: id }); // Format with Indonesian locale
    };

    const toTitleCase = (value: string): string => {
      return value
        .toLowerCase()
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    };

    const formattedData = houseBookmarks.map((item) => ({
      house: item.house,
      user: {
        id: item.user.id,
        name: item.user.name,
        phone_number: item.user.phone_number,
        email: item.user.email,
        profile_risk: item.user.profile_risk
          ? toTitleCase(item.user.profile_risk.name)
          : null,
      },
      tracking_status: item.tracking_status
        ? toTitleCase(item.tracking_status.name)
        : null,
      created_at: formatDate(item.created_at),
    }));

    return this.paginationService.paginate(formattedData, total, page, limit);
  }

  async updateTrackingStatus(admin_id: string, dto: UpdateTrackingStatusDto) {
    const { user_id, house_id, tracking_status_id } = dto;

    // Cari bookmark berdasarkan user_id dan house_id
    const bookmark = await this.prismaService.houseBookmark.findFirst({
      where: {
        user_id: user_id,
        house_id: house_id,
      },
      include: {
        house: true, // Menyertakan data house
      },
    });

    if (!bookmark) {
      throw new NotFoundException(
        'Bookmark not found for the given user and house',
      );
    }

    // Validasi admin pemilik rumah (agar admin lain tidak bisa ubah rumah yang bukan miliknya)
    if (bookmark.house.admin_id !== admin_id) {
      throw new ForbiddenException(
        'You do not have permission to update this tracking status',
      );
    }

    // Cek apakah tracking_status_id yang baru sama dengan yang sudah ada
    if (bookmark.tracking_status_id === tracking_status_id) {
      throw new ConflictException(
        'The new tracking status is the same as the current one',
      );
    }

    // Validasi apakah tracking_status_id ada di database
    const trackingStatus = await this.prismaService.trackingStatus.findUnique({
      where: { id: tracking_status_id },
    });

    if (!trackingStatus) {
      throw new NotFoundException('Tracking status not found in the database');
    }

    // Fungsi bantu untuk konversi ke Title Case dengan spasi jika ada underscore
    const toTitleCase = (value: string): string => {
      return value
        .toLowerCase()
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    };

    // Fungsi untuk format tanggal lokal
    const formatDateToLocal = (date: Date): string => {
      return new Intl.DateTimeFormat('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }).format(date);
    };

    // Update tracking_status_id
    const updatedBookmark = await this.prismaService.houseBookmark.update({
      where: {
        id: bookmark.id,
      },
      data: {
        tracking_status_id: tracking_status_id,
      },
      include: {
        tracking_status: true,
      },
    });

    // Mengubah nama tracking_status ke Title Case
    const trackingStatusTitleCase = updatedBookmark.tracking_status
      ? toTitleCase(updatedBookmark.tracking_status.name)
      : null;

    // Format tanggal (misalnya, updated_at dan created_at) ke format lokal
    const formattedUpdatedAt = updatedBookmark.updated_at
      ? formatDateToLocal(updatedBookmark.updated_at)
      : null;

    const formattedCreatedAt = updatedBookmark.created_at
      ? formatDateToLocal(updatedBookmark.created_at)
      : null;

    return {
      message: 'Tracking status updated successfully',
      data: {
        ...updatedBookmark,
        house_title: bookmark.house.title, // Menambahkan title rumah ke response
        tracking_status: trackingStatusTitleCase, // Menambahkan tracking_status dalam Title Case
        updated_at: formattedUpdatedAt, // Menambahkan tanggal updated_at yang telah diformat
        created_at: formattedCreatedAt, // Menambahkan tanggal created_at yang telah diformat
      },
    };
  }

  async getHousesByAdmin(adminId: string, dto: QueryBookmarkHouseDto) {
    try {
      const total = await this.prismaService.house.count({
        where: {
          admin_id: adminId,
        },
      });

      const limit = this.paginationService.validateLimit(dto.limit) || 10;
      const page =
        this.paginationService.validatePage(dto.page, total, limit) || 1;

      const houses = await this.prismaService.house.findMany({
        where: {
          admin_id: adminId,
        },
        orderBy: [{ created_at: 'desc' }, { id: 'asc' }],
        select: {
          id: true,
          title: true,
          parking_count: true,
          bathroom_count: true,
          room_count: true,
          price: true,
          image_url: true,
          created_at: true,
          house_bookmarks: {
            select: {
              created_at: true,
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  phone_number: true,
                  profile_risk: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                },
              },
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

      const formatDate = (date: Date) => {
        return format(date, 'eeee dd MMMM yyyy HH:mm', { locale: id });
      };

      // Format data
      const result = houses.map((house) => ({
        id: house.id,
        title: house.title,
        parking_count: house.parking_count,
        bathroom_count: house.bathroom_count,
        room_count: house.room_count,
        price: house.price,
        img_url: house.image_url,
        created_at: formatDate(house.created_at),
        total_potential_users: house.house_bookmarks.length,
        users: house.house_bookmarks.map((bookmark) => ({
          name: bookmark.user.name,
          profile_risk: bookmark.user.profile_risk
            ? toTitleCase(bookmark.user.profile_risk.name)
            : null,
          bookmarked_at: formatDate(bookmark.created_at),
        })),
      }));

      // Sort berdasarkan total_potential_users terbanyak
      result.sort((a, b) => b.total_potential_users - a.total_potential_users);

      return this.paginationService.paginate(result, total, page, limit);
    } catch (error) {
      console.error('Error in getHouseByAdmin:', error);
      return {
        success: false,
        message: 'Failed to retrieve houses',
        result: null,
      };
    }
  }

  async getHouseDetail(houseId: number, adminId: string) {
    try {
      // Cari rumah berdasarkan houseId dan adminId
      const house = await this.prismaService.house.findFirst({
        where: {
          id: houseId,
          admin_id: adminId, // Pastikan adminId milik rumah yang dicari
        },
        include: {
          house_bookmarks: {
            include: {
              user: {
                include: {
                  profile_risk: true, // Memasukkan profile_risk
                },
              },
              tracking_status: true, // Memasukkan tracking_status
            },
          },
        },
      });

      if (!house) {
        throw new Error('You are not authorized to view this house details.');
      }

      // Fungsi bantu untuk konversi ke Title Case dengan spasi jika ada underscore
      const toTitleCase = (value: string): string => {
        return value
          .toLowerCase()
          .split('_')
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
      };

      // Format tanggal lokal Indonesia
      const formatDate = (date: Date) => {
        return format(date, 'eeee dd MMMM yyyy HH:mm', { locale: id }); // Format dengan lokal Indonesia
      };

      const bookmarkPromises = house.house_bookmarks.map(async (bookmark) => {
        const coreBankingUser =
          await this.prismaService.coreBankingUser.findFirst({
            where: {
              phone_number: bookmark.user.phone_number,
            },
            select: {
              monthly_inhand_salary: true,
            },
          });

        return {
          user: {
            name: bookmark.user.name,
            profile_risk: bookmark.user.profile_risk
              ? {
                  id: bookmark.user.profile_risk.id,
                  name: toTitleCase(bookmark.user.profile_risk.name),
                }
              : null,
            salary: Number(coreBankingUser?.monthly_inhand_salary) || 0,
          },
          tracking_status: bookmark.tracking_status
            ? {
                id: bookmark.tracking_status.id,
                name: toTitleCase(bookmark.tracking_status.name),
              }
            : null,
        };
      });

      // Wait for all bookmark promises to resolve
      const resolvedBookmarks = await Promise.all(bookmarkPromises);

      // Now create your houseDetails object with the resolved data
      const houseDetails = {
        id: house.id,
        title: house.title,
        price: house.price,
        location: house.location,
        room_count: house.room_count,
        bathroom_count: house.bathroom_count,
        parking_count: house.parking_count,
        land_area: house.land_area,
        building_area: house.building_area,
        image_url: house.image_url,
        created_at: formatDate(house.created_at),
        totalData: house.house_bookmarks.length,
        house_bookmarks: resolvedBookmarks,
      };

      return {
        message: 'House details retrieved successfully',
        data: houseDetails,
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async getFinancingUserDetail(
    adminId: string,
    userId: string,
    houseId: number,
  ) {
    try {
      const user = await this.prismaService.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          phone_number: true,
          profile_risk: {
            select: {
              name: true,
            },
          },
          document: {
            select: {
              ktp_url: true,
              npwp_url: true,
              payslip_url: true,
              created_at: true,
            },
          },
          house_bookmarks: {
            where: {
              house_id: Number(houseId),
              house: {
                admin_id: adminId,
              },
            },
            select: {
              house: {
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
                  image_url: true,
                  created_at: true,
                },
              },
              tracking_status: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      });

      if (!user) {
        throw new NotFoundException('User or house not found');
      }

      const formatDate = (date: Date) => {
        return format(date, 'eeee dd MMMM yyyy HH:mm', { locale: id });
      };

      const toTitleCase = (str: string) =>
        str
          .toLowerCase()
          .split('_')
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');

      const formattedDocuments = user.document
        ? {
            ...user.document,
            created_at: formatDate(user.document.created_at),
          }
        : null;

      const formattedHouseBookmarks = user.house_bookmarks.map((bookmark) => ({
        house: {
          ...bookmark.house,
          created_at: formatDate(bookmark.house.created_at),
        },
        tracking_status: bookmark.tracking_status
          ? {
              id: bookmark.tracking_status.id,
              name: toTitleCase(bookmark.tracking_status.name),
            }
          : null,
      }));

      return {
        message: 'User financing details retrieved successfully',
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            phone_number: user.phone_number,
            profile_risk: user.profile_risk ? user.profile_risk.name : null,
          },
          documents: formattedDocuments,
          house_bookmarks: formattedHouseBookmarks,
        },
      };
    } catch (error) {
      console.error('Error retrieving financing user detail:', error.message);
      throw new Error('Failed to retrieve financing user details');
    }
  }

  async getAdminDetail(adminId: string) {
    try {
      const admin = await this.prismaService.admin.findUnique({
        where: { id: adminId },
        select: {
          id: true,
          name: true,
          email: true,
          created_at: true,
          updated_at: true,
          branch: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      if (!admin) {
        throw new NotFoundException('Admin not found');
      }

      const formatDate = (date: Date) =>
        format(date, 'eeee dd MMMM yyyy HH:mm', { locale: id });

      return {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        created_at: formatDate(admin.created_at),
        updated_at: formatDate(admin.updated_at),
        branch: admin.branch,
      };
    } catch (error) {
      console.error('Error retrieving admin detail:', error.message);
      throw new Error('Failed to retrieve admin detail');
    }
  }
}
