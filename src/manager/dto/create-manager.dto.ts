import { IsDateString, IsEmail, IsMobilePhone, IsOptional, IsString } from 'class-validator';

export class CreateManagerDto {
  @IsEmail()
  email: string;

  @IsString()
  first_name: string;

  @IsString()
  last_name: string;

  @IsMobilePhone('uk-UA')
  phone: string;

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
