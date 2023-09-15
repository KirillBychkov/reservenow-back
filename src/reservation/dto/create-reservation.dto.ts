export class CreateReservationDto {
  user_id: number;
  //   user_id: number;
  rental_object_id: number;
  organization_id: number;
  reservetion_time_start: Date;
  reservetion_time_end: Date;
  description: string;
  price: number;
  //   order_id: number
  created_at: Date;
  update_at: Date;
}
