import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { UpdateTrackingStatusDto } from './dto/update-tracking-status.dto';
import { format } from 'date-fns';  // Jika Anda menggunakan date-fns, atau bisa gunakan moment.js
import { id } from 'date-fns/locale';



@Injectable()
export class AdminService {

    constructor(private readonly prismaService: PrismaService) {}


  async getFinancingUsers(adminId: string, page: number, limit: number) {
      try {
        // Validate page and limit
        if (!Number.isInteger(page) || page <= 0) {
          throw new Error("Page must be a positive integer.");
        }
        if (!Number.isInteger(limit) || limit <= 0) {
          throw new Error("Limit must be a positive integer.");
        }
    
        const skip = (page - 1) * limit;  // Calculate skip for pagination
        const where = {
          house: {
            admin_id: adminId,  // Filter by admin_id from JWT
          },
        };
    
        // Fetch house bookmarks with pagination and latest created_at
        const houseBookmarks = await this.prismaService.houseBookmark.findMany({
          where,
          skip,  // Apply skip for pagination
          take: limit,  // Apply limit to get only a specific number of records
          orderBy: {
            created_at: 'desc',  // Order by created_at in descending order
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
    
        // Calculate total data count
        const totalData = await this.prismaService.houseBookmark.count({
          where,
        });
    
        const formatDate = (date: Date) => {
          return format(date, "eeee dd MMMM yyyy HH:mm", { locale: id });  // Format with Indonesian locale
        };
    
        // Helper function to convert ENUM to Title Case with spaces
        const toTitleCase = (value: string): string => {
          return value
            .toLowerCase()
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
        };
    
        if (houseBookmarks.length === 0) {
          return {
            totalData: 0,
            data: [],
            totalPages: 0,
            currentPage: page,
          };
        }
    
        // Format data for response
        const formattedData = houseBookmarks.map(item => ({
          house: item.house,
          user: {
            id: item.user.id,
            name: item.user.name,
            phone_number: item.user.phone_number,
            email: item.user.email,
            profile_risk: item.user.profile_risk
              ? toTitleCase(item.user.profile_risk.name)
              : null,  // Convert profile_risk name to Title Case if available
          },
          tracking_status: item.tracking_status
            ? toTitleCase(item.tracking_status.name)
            : null,  // Convert tracking_status name to Title Case if available
          created_at: formatDate(item.created_at),  // Format created_at with Indonesian locale
        }));
    
        return {
          totalData,
          data: formattedData,
          totalPages: Math.ceil(totalData / limit),  // Calculate total pages
          currentPage: page,  // Current page
        };
      } catch (error) {
        console.error('Error retrieving house bookmarks:', error.message);
        return {
          totalData: 0,
          data: [],
          error: error.message,
        };
      }
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
        throw new NotFoundException('Bookmark not found for the given user and house');
      }
    
      // Validasi admin pemilik rumah (agar admin lain tidak bisa ubah rumah yang bukan miliknya)
      if (bookmark.house.admin_id !== admin_id) {
        throw new ForbiddenException('You do not have permission to update this tracking status');
      }
    
      // Cek apakah tracking_status_id yang baru sama dengan yang sudah ada
      if (bookmark.tracking_status_id === tracking_status_id) {
        throw new ConflictException('The new tracking status is the same as the current one');
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
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
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
    
    
  async getHousesByAdmin(adminId: string, page: number, limit: number) {
    try {
      const skip = (page - 1) * limit;
  
      const houses = await this.prismaService.house.findMany({
        where: {
          admin_id: adminId,
        },
        skip,
        take: limit,
        orderBy: {
          created_at: 'desc',
        },
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
  
      const totalData = await this.prismaService.house.count({
        where: {
          admin_id: adminId,
        },
      });
  
      const toTitleCase = (value: string): string => {
        return value
          .toLowerCase()
          .split('_')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
      };
  
      const formatDate = (date: Date) => {
        return format(date, "eeee dd MMMM yyyy HH:mm", { locale: id });
      };
  
      const result = houses.map((house) => ({
        id: house.id,
        title: house.title,
        parking_count: house.parking_count,
        bathroom_count: house.bathroom_count,
        room_count: house.room_count,
        price: house.price,
        img_url: house.image_url,
        created_at: formatDate(house.created_at),
        totalPotentialUser: house.house_bookmarks.length,
        users: house.house_bookmarks.map((bookmark) => ({
          name: bookmark.user.name,
          profile_risk: bookmark.user.profile_risk
            ? toTitleCase(bookmark.user.profile_risk.name)
            : null,
          bookmarked_at: formatDate(bookmark.created_at),
        })),
      }));
  
      return {
        totalData,
        totalPages: Math.ceil(totalData / limit),
        currentPage: page,
        data: result,
      };
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
        throw new Error("You are not authorized to view this house details.");
      }
  
      // Fungsi bantu untuk konversi ke Title Case dengan spasi jika ada underscore
      const toTitleCase = (value: string): string => {
        return value
          .toLowerCase()
          .split('_')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
      };
  
      // Format tanggal lokal Indonesia
      const formatDate = (date: Date) => {
        return format(date, "eeee dd MMMM yyyy HH:mm", { locale: id }); // Format dengan lokal Indonesia
      };
  
      // Menyiapkan response data
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
        created_at: formatDate(house.created_at), // Menggunakan format lokal Indonesia
        totalData: house.house_bookmarks.length,
        house_bookmarks: house.house_bookmarks.map((bookmark) => ({
          user: {
            name: bookmark.user.name,
            profile_risk: bookmark.user.profile_risk
              ? {
                  id: bookmark.user.profile_risk.id,
                  name: toTitleCase(bookmark.user.profile_risk.name), // Mengubah profile_risk ke Title Case
                }
              : null,  // Jika tidak ada profile_risk, set null
          },
          tracking_status: bookmark.tracking_status
            ? {
                id: bookmark.tracking_status.id,
                name: toTitleCase(bookmark.tracking_status.name), // Mengubah tracking_status ke Title Case
              }
            : null,  // Jika tidak ada tracking_status, set null
        })),
      };
  
      return {
        message: "House details retrieved successfully",
        data: houseDetails,
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }
  
  
}
