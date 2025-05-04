import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  UseGuards,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { BookmarksService } from './bookmarks.service';
import { CreateBookmarkDto } from './dto/create-bookmark.dto';
import { UpdateBookmarkDto } from './dto/update-bookmark.dto';
import { JwtGuard } from '@/auth/guard';
import { User } from '@/auth/decorator/user.decorator';

@UseGuards(JwtGuard)
@Controller('bookmarks')
export class BookmarksController {
  constructor(private readonly bookmarksService: BookmarksService) {}

  @Post()
  async createHouseBookmark(
    @Body() createBookmarkDto: CreateBookmarkDto,
    @User('user_id') user_id: string,
  ) {
    return this.bookmarksService.createHouseBookmark(
      createBookmarkDto,
      user_id,
    );
  }

  @Get()
  async getBookmarkedHouses(@User() user: any) {
    const result = await this.bookmarksService.getBookmarkedHouses(user.id);

    if (!result.data || result.data.length === 0) {
      throw new NotFoundException('No bookmarked houses found');
    }

    return {
      total_data: result.totalData,
      data: result.data,
    };
  }

  @Get('status')
  async getTrackingStatuses() {
    const statuses = await this.bookmarksService.getTrackingStatuses();

    return {
      message: 'Tracking statuses retrieved successfully',
      data: statuses,
    };
  }
}
