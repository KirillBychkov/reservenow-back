import {
  Min,
  Max,
  ValidateIf,
  IsMobilePhone,
  IsString,
  IsOptional,
  IsDateString,
  IsNumber,
} from 'class-validator';

export class UpdateTrainerDto {
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
  @IsOptional()
  price_per_hour?: number;

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
