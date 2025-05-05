import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  UseGuards,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { BookmarksService } from './bookmarks.service';
import { CreateBookmarkDto } from './dto/create-bookmark.dto';
import { UpdateBookmarkDto } from './dto/update-bookmark.dto';
import { JwtGuard } from '@/auth/guard';
import { User } from '@/auth/decorator/user.decorator';
import { BaseResponseDto } from '@/common/dto/base-response.dto';

@UseGuards(JwtGuard)
@Controller('bookmarks')
export class BookmarksController {
  constructor(private readonly bookmarksService: BookmarksService) {}

  @Post()
  async createHouseBookmark(
    @Body() createBookmarkDto: CreateBookmarkDto,
    @User('user_id') user_id: string,
  ) {
    try {
      const result = await this.bookmarksService.createHouseBookmark(
        createBookmarkDto,
        user_id,
      );
      return result;
    } catch (error) {
      throw new BadRequestException(
        error.message || 'Failed to create bookmark',
      );
    }
  }

  @Get()
  async getBookmarkedHouses(@User('user_id') user_id: string) {
    try {
      const result = await this.bookmarksService.getBookmarkedHouses(user_id);

      if (!result.data || result.data.length === 0) {
        return BaseResponseDto.error('No bookmarked houses found', []);
      }

      return {
        total_data: result.totalData,
        data: result.data,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        error.message || 'Failed to retrieve bookmarked houses',
      );
    }
  }

  @Get('status')
  async getTrackingStatuses() {
    try {
      const statuses = await this.bookmarksService.getTrackingStatuses();

      if (!statuses || statuses.length === 0) {
        throw new NotFoundException('No tracking statuses found');
      }

      return {
        message: 'Tracking statuses retrieved successfully',
        data: statuses,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        error.message || 'Failed to retrieve tracking statuses',
      );
    }
  }

  @Get('/details/:houseId')
  async getBookmarkDetail(
    @Param('houseId', ParseIntPipe) houseId: number,
    @User('user_id') userId: string,
  ) {
    try {
      const result = await this.bookmarksService.getBookmarkDetail(
        userId,
        houseId,
      );

      return {
        message: 'Bookmark detail retrieved successfully',
        data: result,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to retrieve bookmark detail');
    }
  }

  @Get('tracker')
  async getTracker(@User('user_id') userId: string) {
    const result = await this.bookmarksService.getTracker(userId);
    return {
      message: 'Accepted tracker list retrieved successfully',
      data: result,
    };
  }
}
