import { Controller, Get, Post, Body, Patch, Param, Delete, Put, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { User } from '@/auth/decorator';
import { AdminGuard, JwtGuard } from '@/auth/guard';
import { Admin } from '@prisma/client';
import { UpdateTrackingStatusDto } from './dto/update-tracking-status.dto';

@UseGuards(JwtGuard, AdminGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

 @Get('financing-users')
async getFinancingUsers(@User('user_id') adminId: string) {
  try {
    const result = await this.adminService.getFinancingUsers(adminId);
    return result;  // Mengembalikan hasil dari service
  } catch (error) {
    return {
      message: 'Failed to retrieve financing users',
      error: error.message,
    };
  }
}

  
  // @Put('update-tracking-status')
  // async updateTrackingStatus(
  //   @User() admin: Admin,   // Admin ID akan diambil dari decorator @User
  //   @Body() dto: UpdateTrackingStatusDto,
  // ) {
  //   try {
  //     console.log('Admin ID:', admin.id);  // Debugging untuk memastikan admin ID ada
  //     return await this.adminService.updateTrackingStatus(admin.id, dto);
  //   } catch (error) {
  //     return {
  //       message: 'Failed to update tracking status',
  //       error: error.message,
  //     };
  //   }
  // }

  @Put('update-tracking-status')
async updateTrackingStatus(
  @User('user_id') admin_id: string,   // Langsung ambil admin.id
  @Body() dto: UpdateTrackingStatusDto,
) {
  try {
    console.log('Admin ID:', admin_id);  // Debugging untuk memastikan admin ID ada
    return await this.adminService.updateTrackingStatus(admin_id, dto);
  } catch (error) {
    return {
      message: 'Failed to update tracking status',
      error: error.message,
    };
  }
}


}