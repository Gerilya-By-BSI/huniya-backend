import { IsNumberString, IsOptional, IsString } from 'class-validator';

export class QueryHouseDto {
  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @IsOptional()
  min_price?: number;

  @IsNumberString()
  @IsOptional()
  max_price?: number;

  @IsNumberString()
  @IsOptional()
  room_count?: number;

  @IsNumberString()
  @IsOptional()
  bathroom_count?: number;

  @IsNumberString()
  @IsOptional()
  parking_count?: number;

  @IsNumberString()
  @IsOptional()
  min_land_area?: number;

  @IsNumberString()
  @IsOptional()
  max_land_area?: number;

  @IsNumberString()
  @IsOptional()
  min_building_area?: number;

  @IsNumberString()
  @IsOptional()
  max_building_area?: number;

  @IsString()
  @IsOptional()
  search?: string;
}
