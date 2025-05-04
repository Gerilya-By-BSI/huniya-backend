import { Controller, Get, Post, Body, Patch, Param, Delete, Put, UseGuards, Query } from '@nestjs/common';
import { AdminService } from './admin.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { User } from '@/auth/decorator';
import { AdminGuard, JwtGuard } from '@/auth/guard';
import { Admin } from '@prisma/client';
import { UpdateTrackingStatusDto } from './dto/update-tracking-status.dto';
import { QueryPaginationDto } from './dto/query-pagination.dto';

@UseGuards(JwtGuard, AdminGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}


  @Get('financing-users')
  async getFinancingUsers(
    @User('user_id') adminId: string,
    @Query() query: QueryPaginationDto,
  ) {
    try {
      const { page, limit } = query;
      const result = await this.adminService.getFinancingUsers(adminId, page, limit);
      return result;
    } catch (error) {
      return {
        success: false,
        message: 'Failed to retrieve financing users',
        error: error.message,
      };
    }
  }


  @Put('update-tracking-status')
async updateTrackingStatus(
  @User('user_id') admin_id: string,   
  @Body() dto: UpdateTrackingStatusDto,
) {
  try {
    return await this.adminService.updateTrackingStatus(admin_id, dto);
  } catch (error) {
    return {
      message: 'Failed to update tracking status',
      error: error.message,
    };
  }
}

  @Get('list-houses')
  async getHousesByAdmin(
  @User('user_id') adminId: string,
  @Query() query: QueryPaginationDto,
) {
    try {
      const result = await this.adminService.getHousesByAdmin(adminId, query.page, query.limit);
      return result;
    } catch (error) {
        return {
        success: false,
      message: 'Failed to retrieve houses by admin',
        error: error.message,
      };
    }
  }


@Get('house-detail/:id')
  async getHouseDetail(@Param('id') houseId: string, @User('user_id') adminId: string) {
    try {
      const result = await this.adminService.getHouseDetail(Number(houseId), adminId);
      return result;
    } catch (error) {
      return {
        message: 'Failed to retrieve house details',
        error: error.message,
      };
    }
  }



}