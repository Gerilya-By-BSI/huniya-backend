import {
  IsString,
  IsInt,
  IsOptional,
  IsNumber,
  Min,
  Max,
} from 'class-validator';

export class CreateHouseDto {
  @IsString()
  title: string;

  @IsString()
  location: string;

  @IsInt()
  @Min(0)
  price: number;

  @IsInt()
  @Min(1)
  room_count: number;

  @IsInt()
  @Min(1)
  bathroom_count: number;

  @IsInt()
  @Min(0)
  parking_count: number;

  @IsNumber()
  @Min(0)
  land_area: number;

  @IsNumber()
  @Min(0)
  building_area: number;

  @IsInt()
  adminId: number; // Admin ID for the user creating the house listing
}
