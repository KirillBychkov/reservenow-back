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
  monday_start_hours?: number;
  monday_end_hours?: number;
  tuesday_start_hours?: number;
  tuesday_end_hours?: number;
  wednesday_start_hours?: number;
  wednesday_end_hours?: number;
  thursday_start_hours?: number;
  thursday_end_hours?: number;
  friday_start_hours?: number;
  friday_end_hours?: number;
  saturday_start_hours?: number;
  saturday_end_hours?: number;
  sunday_start_hours?: number;
  sunday_end_hours?: number;
}
