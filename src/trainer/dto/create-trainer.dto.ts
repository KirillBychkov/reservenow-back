import {
  Min,
  Max,
  ValidateIf,
  IsMobilePhone,
  IsEmail,
  IsString,
  IsOptional,
  IsDateString,
  IsNumber,
} from 'class-validator';

export class CreateTrainerDto {
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

  @IsString()
  @IsOptional()
  image?: string;

  @IsDateString()
  @IsOptional()
  hired_at?: string;

  @IsDateString()
  @IsOptional()
  resigned_at?: string;

  @IsNumber()
  price_per_hour: number;

  @Min(0)
  @Max(24)
  @ValidateIf((_, value) => !!value)
  monday_start_hours?: number;

  @Min(0)
  @Max(24)
  @ValidateIf((_, value) => !!value)
  monday_end_hours?: number;

  @Min(0)
  @Max(24)
  @ValidateIf((_, value) => !!value)
  tuesday_start_hours?: number;

  @Min(0)
  @Max(24)
  @ValidateIf((_, value) => !!value)
  tuesday_end_hours?: number;

  @Min(0)
  @Max(24)
  @ValidateIf((_, value) => !!value)
  wednesday_start_hours?: number;

  @Min(0)
  @Max(24)
  @ValidateIf((_, value) => !!value)
  wednesday_end_hours?: number;

  @Min(0)
  @Max(24)
  @ValidateIf((_, value) => !!value)
  thursday_start_hours?: number;

  @Min(0)
  @Max(24)
  @ValidateIf((_, value) => !!value)
  thursday_end_hours?: number;

  @Min(0)
  @Max(24)
  @ValidateIf((_, value) => !!value)
  friday_start_hours?: number;

  @Min(0)
  @Max(24)
  @ValidateIf((_, value) => !!value)
  friday_end_hours?: number;

  @Min(0)
  @Max(24)
  @ValidateIf((_, value) => !!value)
  saturday_start_hours?: number;

  @Min(0)
  @Max(24)
  @ValidateIf((_, value) => !!value)
  saturday_end_hours?: number;

  @Min(0)
  @Max(24)
  @ValidateIf((_, value) => !!value)
  sunday_start_hours?: number;

  @Min(0)
  @Max(24)
  @ValidateIf((_, value) => !!value)
  sunday_end_hours?: number;
}
