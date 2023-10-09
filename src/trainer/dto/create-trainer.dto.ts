import { Min, Max, ValidateIf } from 'class-validator';

export class CreateTrainerDto {
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  description?: string;
  image?: string;
  hired_at: Date;
  resigned_at?: Date;
  price_per_hour: number;

  @Min(0)
  @Max(23)
  @ValidateIf((_, value) => value !== undefined)
  monday_start_hours?: number;

  @Min(0)
  @Max(23)
  @ValidateIf((_, value) => value !== undefined)
  monday_end_hours?: number;

  @Min(0)
  @Max(23)
  @ValidateIf((_, value) => value !== undefined)
  tuesday_start_hours?: number;

  @Min(0)
  @Max(23)
  @ValidateIf((_, value) => value !== undefined)
  tuesday_end_hours?: number;

  @Min(0)
  @Max(23)
  @ValidateIf((_, value) => value !== undefined)
  wednesday_start_hours?: number;

  @Min(0)
  @Max(23)
  @ValidateIf((_, value) => value !== undefined)
  wednesday_end_hours?: number;

  @Min(0)
  @Max(23)
  @ValidateIf((_, value) => value !== undefined)
  thursday_start_hours?: number;

  @Min(0)
  @Max(23)
  @ValidateIf((_, value) => value !== undefined)
  thursday_end_hours?: number;

  @Min(0)
  @Max(23)
  @ValidateIf((_, value) => value !== undefined)
  friday_start_hours?: number;

  @Min(0)
  @Max(23)
  @ValidateIf((_, value) => value !== undefined)
  friday_end_hours?: number;

  @Min(0)
  @Max(23)
  @ValidateIf((_, value) => value !== undefined)
  saturday_start_hours?: number;

  @Min(0)
  @Max(23)
  @ValidateIf((_, value) => value !== undefined)
  saturday_end_hours?: number;

  @Min(0)
  @Max(23)
  @ValidateIf((_, value) => value !== undefined)
  sunday_start_hours?: number;

  @Min(0)
  @Max(23)
  @ValidateIf((_, value) => value !== undefined)
  sunday_end_hours?: number;
}
