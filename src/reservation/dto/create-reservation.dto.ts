export class CreateReservationDto {
  trainer_id?: number;
  rental_object_id?: number;
  equipment_id?: number;
  organization_id: number;
  reservation_time_start: Date;
  reservation_time_end: Date;
  description: string;
}
