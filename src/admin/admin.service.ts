import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { UpdateTrackingStatusDto } from './dto/update-tracking-status.dto';
import { format } from 'date-fns';  // Jika Anda menggunakan date-fns, atau bisa gunakan moment.js


@Injectable()
export class AdminService {

    constructor(private readonly prismaService: PrismaService) {}
  
  
    async getFinancingUsers(admin_id: string) {
      try {
        // Debugging: Cek admin_id yang diterima
        console.log('Admin ID:', admin_id);
  
        // Query ke database untuk mengambil data house_bookmarks yang terkait dengan rumah yang dikelola oleh admin
        const houseBookmarks = await this.prismaService.houseBookmark.findMany({
          where: {
            house: {
              admin_id: admin_id, // Filter berdasarkan admin_id rumah
            },
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
                id: true,  // Menambahkan id user
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
  
        // Debugging: Cek hasil query
        console.log('House bookmarks found:', houseBookmarks);
        console.log('Total house bookmarks:', houseBookmarks.length);
  
        // Format tanggal menjadi "Kamis 10 Juli 2020 19:45"
        const formatDate = (date: Date) => {
          return format(date, "eeee dd MMMM yyyy HH:mm"); // Format yang diinginkan
        };
  
        // Jika tidak ada data yang ditemukan
        if (houseBookmarks.length === 0) {
          return {
            totalData: 0,
            data: [],
          };
        }
  
        // Map hasil query dan format created_at dan tracking_status sesuai dengan format yang diinginkan
        const formattedData = houseBookmarks.map(item => ({
          house: item.house, // House di atas
          user: {
            id: item.user.id,  // Menambahkan user_id
            name: item.user.name,
            phone_number: item.user.phone_number,
            email: item.user.email,
            profile_risk: item.user.profile_risk ? item.user.profile_risk.name : null, // Jika tidak ada profile_risk, kembalikan null
          },
          tracking_status: {
            id: item.tracking_status.id,
            name: item.tracking_status.name,
          },
          created_at: formatDate(item.created_at), // Format created_at di bawah
        }));
  
        // Mengembalikan data sukses dengan format yang diinginkan
        return {
          totalData: formattedData.length,
          data: formattedData,
        };
      } catch (error) {
        // Menangani error jika terjadi masalah saat query atau pemrosesan data
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
        house: true,
      },
    });

    if (!bookmark) {
      throw new NotFoundException('Bookmark not found for the given user and house');
    }

    // Validasi admin pemilik rumah (agar admin lain tidak bisa ubah rumah yang bukan miliknya)
    if (bookmark.house.admin_id !== admin_id) {
      throw new ForbiddenException('You do not have permission to update this tracking status');
    }

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

    return {
      message: 'Tracking status updated successfully',
      data: updatedBookmark,
    };
  }

  async getHousesByAdmin(adminId: string) {
    try {
      const houses = await this.prismaService.house.findMany({
        where: {
          admin_id: adminId,
        },
        select: {
          id: true,
          title: true,
          parking_count:true,
          bathroom_count:true,
          room_count:true,
          price:true,
          image_url:true,
          house_bookmarks: {
            select: {
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
  
      const result = houses.map((house) => ({
        id: house.id,
        title: house.title,
        parking_count:house.parking_count,
        bathroom_count:house.bathroom_count,
        room_count:house.room_count,
        price:house.price,
        img_url: house.image_url,
        totalBookmarks: house.house_bookmarks.length,
        users: house.house_bookmarks.map((bookmark) => ({
          id: bookmark.user.id,
          name: bookmark.user.name,
          email: bookmark.user.email,
          phone_number: bookmark.user.phone_number,
          profile_risk: bookmark.user.profile_risk,
        })),
      }));
  
      return {
          totalData: result.length,
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
      const house = await this.prismaService.house.findFirst({
        where: {
          id: houseId,
          admin_id: adminId,
        },
        include: {
          house_bookmarks: {
            include: {
              user: {
                include: {
                  profile_risk: true,  // Memasukkan profile_risk
                },
              },
              tracking_status: true, // Memasukkan tracking_status
            },
          },
        },
      });
  
      if (!house) {
        throw new Error("House not found or not owned by the authenticated admin");
      }
  
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
        created_at: house.created_at,
        house_bookmarks: house.house_bookmarks.map((bookmark) => ({
          user: {
            id: bookmark.user.id,
            name: bookmark.user.name,
            phone_number: bookmark.user.phone_number,
            email: bookmark.user.email,
            profile_risk: bookmark.user.profile_risk ? { id: bookmark.user.profile_risk.id, name: bookmark.user.profile_risk.name } : null,  // Jika tidak ada profile_risk, set null
          },
          tracking_status: {
            id: bookmark.tracking_status.id,  // Menambahkan ID dari tracking_status
            name: bookmark.tracking_status.name,
          },
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
