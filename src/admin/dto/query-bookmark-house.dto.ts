import { IsInt, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export class QueryBookmarkHouseDto {
  @IsOptional()
  @IsInt({ message: 'Page must be a positive integer.' })
  @Transform(({ value }) => parseInt(value, 10))
  page: number = 1;

  @IsOptional()
  @IsInt({ message: 'Limit must be a positive integer.' })
  @Transform(({ value }) => parseInt(value, 10))
  limit: number = 10;
}
