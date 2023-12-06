import { Min, Max, ValidateIf, IsMobilePhone } from 'class-validator';

export class CreateTrainerDto {
  email: string;
  first_name: string;
  last_name: string;

  @IsMobilePhone('uk-UA')
  phone: string;

  description?: string;
  image?: string;
  hired_at?: Date;
  resigned_at?: Date;
  price_per_hour: number;

  @Min(0)
  @Max(24)
  @ValidateIf((_, value) => (value ? true : false))
  monday_start_hours?: number;

  @Min(0)
  @Max(24)
  @ValidateIf((_, value) => (value ? true : false))
  monday_end_hours?: number;

  @Min(0)
  @Max(24)
  @ValidateIf((_, value) => (value ? true : false))
  tuesday_start_hours?: number;

  @Min(0)
  @Max(24)
  @ValidateIf((_, value) => (value ? true : false))
  tuesday_end_hours?: number;

  @Min(0)
  @Max(24)
  @ValidateIf((_, value) => (value ? true : false))
  wednesday_start_hours?: number;

  @Min(0)
  @Max(24)
  @ValidateIf((_, value) => (value ? true : false))
  wednesday_end_hours?: number;

  @Min(0)
  @Max(24)
  @ValidateIf((_, value) => (value ? true : false))
  thursday_start_hours?: number;

  @Min(0)
  @Max(24)
  @ValidateIf((_, value) => (value ? true : false))
  thursday_end_hours?: number;

  @Min(0)
  @Max(24)
  @ValidateIf((_, value) => (value ? true : false))
  friday_start_hours?: number;

  @Min(0)
  @Max(24)
  @ValidateIf((_, value) => (value ? true : false))
  friday_end_hours?: number;

  @Min(0)
  @Max(24)
  @ValidateIf((_, value) => (value ? true : false))
  saturday_start_hours?: number;

  @Min(0)
  @Max(24)
  @ValidateIf((_, value) => (value ? true : false))
  saturday_end_hours?: number;

  @Min(0)
  @Max(24)
  @ValidateIf((_, value) => (value ? true : false))
  sunday_start_hours?: number;

  @Min(0)
  @Max(24)
  @ValidateIf((_, value) => (value ? true : false))
  sunday_end_hours?: number;
}
