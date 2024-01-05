import { IsDateString, IsMobilePhone, IsOptional, IsString } from 'class-validator';

export class UpdateManagerDto {
  @IsString()
  @IsOptional()
  first_name?: string;

  @IsString()
  @IsOptional()
  last_name?: string;

  @IsMobilePhone('uk-UA')
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  @IsOptional()
  hired_at?: string;

  @IsDateString()
  @IsOptional()
  resigned_at?: string;
}
