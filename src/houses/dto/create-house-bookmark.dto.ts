import { IsNumber, IsOptional } from 'class-validator';

export class CreateHouseBookmarkDto {
  @IsNumber()
  house_id: number;

  @IsNumber()
  tracking_status_id: number;

  @IsOptional()  // Karena user_id akan diisi otomatis di controller, jadi sifatnya opsional
  user_id?: string;  // user_id tidak perlu divalidasi karena akan diambil dari login
}
