import { Reservation } from '../entities/reservation.entity';

export default class FindAllReservationsByClientDto {
  filters: {
    skip?: number;
    limit?: number;
    search?: string;
    sorted?: string;
    total: number;
    received: number;
  };
  data: Reservation[];
}
