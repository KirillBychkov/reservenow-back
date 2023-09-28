export class CreateReservationDto {
  user_id: number;
  trainer_id?: number;
  rental_object_id?: number;
  equipment_id?: number;
  organization_id: number;
  reservetion_time_start: Date;
  reservetion_time_end: Date;
  description: string;
  price: number;
}
