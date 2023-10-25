import { Min, Max, ValidateIf } from 'class-validator';

export class CreateOrganizationDto {
  name: string;
  description?: string;
  phone: string;
  address: string;

  @Min(0)
  @Max(23)
  @ValidateIf((_, value) => value !== null)
  monday_start_hours?: number;

  @Min(0)
  @Max(23)
  @ValidateIf((_, value) => value !== null)
  monday_end_hours?: number;

  @Min(0)
  @Max(23)
  @ValidateIf((_, value) => value !== null)
  tuesday_start_hours?: number;

  @Min(0)
  @Max(23)
  @ValidateIf((_, value) => value !== null)
  tuesday_end_hours?: number;

  @Min(0)
  @Max(23)
  @ValidateIf((_, value) => value !== null)
  wednesday_start_hours?: number;

  @Min(0)
  @Max(23)
  @ValidateIf((_, value) => value !== null)
  wednesday_end_hours?: number;

  @Min(0)
  @Max(23)
  @ValidateIf((_, value) => value !== null)
  thursday_start_hours?: number;

  @Min(0)
  @Max(23)
  @ValidateIf((_, value) => value !== null)
  thursday_end_hours?: number;

  @Min(0)
  @Max(23)
  @ValidateIf((_, value) => value !== null)
  friday_start_hours?: number;

  @Min(0)
  @Max(23)
  @ValidateIf((_, value) => value !== null)
  friday_end_hours?: number;

  @Min(0)
  @Max(23)
  @ValidateIf((_, value) => value !== null)
  saturday_start_hours?: number;

  @Min(0)
  @Max(23)
  @ValidateIf((_, value) => value !== null)
  saturday_end_hours?: number;

  @Min(0)
  @Max(23)
  @ValidateIf((_, value) => value !== null)
  sunday_start_hours?: number;

  @Min(0)
  @Max(23)
  @ValidateIf((_, value) => value !== null)
  sunday_end_hours?: number;
}
