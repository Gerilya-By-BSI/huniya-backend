import { IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateBookmarkDto {
  @IsNotEmpty()
  @Type(() => Number)
  house_id: number;

  @IsNotEmpty()
  @Type(() => Number)
  tracking_status_id: number;
}
