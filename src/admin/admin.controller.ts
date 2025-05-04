import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
  UseGuards,
  Query,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { User } from '@/auth/decorator';
import { AdminGuard, JwtGuard } from '@/auth/guard';
import { UpdateTrackingStatusDto } from './dto/update-tracking-status.dto';
import { QueryBookmarkHouseDto } from './dto/query-bookmark-house.dto';
import { BaseResponseDto } from '@/common/dto/base-response.dto';

@UseGuards(JwtGuard, AdminGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('financing-users')
  async getFinancingUsers(
    @User('user_id') adminId: string,
    @Query() query: QueryBookmarkHouseDto,
  ) {
    const data = await this.adminService.getFinancingUsers(adminId, query);

    return BaseResponseDto.success(
      'Financing users fetched successfully',
      data,
    );
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
    @Query() query: QueryBookmarkHouseDto,
  ) {
    try {
      const result = await this.adminService.getHousesByAdmin(adminId, query);
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
  async getHouseDetail(
    @Param('id') houseId: string,
    @User('user_id') adminId: string,
  ) {
    try {
      const result = await this.adminService.getHouseDetail(
        Number(houseId),
        adminId,
      );
      return result;
    } catch (error) {
      return {
        message: 'Failed to retrieve house details',
        error: error.message,
      };
    }
  }

  @Get('financing-users/:userId/house/:houseId')
async getFinancingUserDetail(
  @Param('userId') userId: string,
  @Param('houseId') houseId: number,
  @User('user_id') adminId: string,  // Ambil adminId dari JWT
) {
  try {
    console.log(userId,houseId,adminId)
    const result = await this.adminService.getFinancingUserDetail(adminId, userId, houseId);
    return result;
  } catch (error) {
    return {
      success: false,
      message: 'Failed to retrieve financing user detail',
      error: error.message,
    };
  }
}

@Get('detail')
async getAdminDetail(@User('user_id') adminId: string) {
  try {
    const result = await this.adminService.getAdminDetail(adminId);
    return {
      message: 'Admin detail retrieved successfully',
      data: result,
    };
  } catch (error) {
    return {
      success: false,
      message: 'Failed to retrieve admin detail',
      error: error.message,
    };
  }
}



}
