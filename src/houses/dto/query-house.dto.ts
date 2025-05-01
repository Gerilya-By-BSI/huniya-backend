import { IsNumberString, IsOptional, IsString } from 'class-validator';

export class QueryHouseDto {
  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @IsOptional()
  minPrice?: number;

  @IsNumberString()
  @IsOptional()
  maxPrice?: number;

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
  minLandArea?: number;

  @IsNumberString()
  @IsOptional()
  maxLandArea?: number;

  @IsNumberString()
  @IsOptional()
  minBuildingArea?: number;

  @IsNumberString()
  @IsOptional()
  maxBuildingArea?: number;

  @IsString()
  @IsOptional()
  search?: string;
}
