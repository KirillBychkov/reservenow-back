import { Min, Max, ValidateIf, IsInt } from 'class-validator';

export class CreateRentalObjectDto {
  organization_id: number;
  name: string;
  description?: string;
  phone?: string;
  address: string;

  @Min(0)
  @IsInt()
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
