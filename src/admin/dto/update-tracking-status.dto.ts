import { IsInt, IsString } from "class-validator";

export class UpdateTrackingStatusDto {
  @IsString()
  user_id: string;

  @IsInt()
  house_id: number;

  @IsInt()
  tracking_status_id: number;
}
