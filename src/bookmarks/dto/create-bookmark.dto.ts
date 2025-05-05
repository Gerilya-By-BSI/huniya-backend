import { IsInt, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateBookmarkDto {
  @IsNotEmpty()
  @IsInt()
  tenor: number;

  @IsNotEmpty()
  @Type(() => Number)
  house_id: number;

  @IsNotEmpty()
  @Type(() => Number)
  tracking_status_id: number;
}
