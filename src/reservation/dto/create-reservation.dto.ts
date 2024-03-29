import { IsDateString, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateReservationDto {
  @IsNumber()
  @IsOptional()
  trainer_id?: number;

  @IsNumber()
  @IsOptional()
  rental_object_id?: number;

  @IsNumber()
  @IsOptional()
  equipment_id?: number;

  @IsDateString()
  @IsOptional()
  reservation_time_start?: string;

  @IsDateString()
  @IsOptional()
  reservation_time_end?: string;

  @IsString()
  @IsOptional()
  description?: string;
}
