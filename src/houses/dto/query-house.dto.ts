import { IsOptional, IsString, IsNumber, IsInt } from 'class-validator';
import { Transform } from 'class-transformer';

export class QueryHouseDto {
  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsNumber()
  @IsInt()
  min_price?: number;

  @IsOptional()
  @IsNumber()
  @IsInt()
  max_price?: number;

  @IsOptional()
  @IsNumber()
  @IsInt()
  room_count?: number;

  @IsOptional()
  @IsNumber()
  @IsInt()
  bathroom_count?: number;

  @IsOptional()
  @IsNumber()
  @IsInt()
  parking_count?: number;

  @IsOptional()
  @IsNumber()
  @IsInt()
  min_land_area?: number;

  @IsOptional()
  @IsNumber()
  @IsInt()
  max_land_area?: number;

  @IsOptional()
  @IsNumber()
  @IsInt()
  min_building_area?: number;

  @IsOptional()
  @IsNumber()
  @IsInt()
  max_building_area?: number;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10)) // Convert page to integer
  @IsInt()
  page: number = 1;  // Default page is 1

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10)) // Convert limit to integer
  @IsInt()
  limit: number = 10;  // Default limit is 10
}
