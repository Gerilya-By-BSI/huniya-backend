import { IsOptional, IsString, IsNumberString, IsInt } from 'class-validator';
import { Transform } from 'class-transformer';

export class QueryHouseDto {
  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsNumberString()
  min_price?: string;

  @IsOptional()
  @IsNumberString()
  max_price?: string;

  @IsOptional()
  @IsNumberString()
  room_count?: string;

  @IsOptional()
  @IsNumberString()
  bathroom_count?: string;

  @IsOptional()
  @IsNumberString()
  parking_count?: string;

  @IsOptional()
  @IsNumberString()
  min_land_area?: string;

  @IsOptional()
  @IsNumberString()
  max_land_area?: string;

  @IsOptional()
  @IsNumberString()
  min_building_area?: string;

  @IsOptional()
  @IsNumberString()
  max_building_area?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsInt()
  @Transform(({ value }) => parseInt(value, 10)) // Convert page to integer
  page: number = 1; // Default page is 1

  @IsOptional()
  @IsInt()
  @Transform(({ value }) => parseInt(value, 10)) // Convert limit to integer
  limit: number = 10; // Default limit is 10
}
