import { CreateClientDto } from 'src/client/dto/create-client.dto';
import { CreateReservationDto } from 'src/reservation/dto/create-reservation.dto';

export class CreateOrderDto {
  user_id: number;
  client: CreateClientDto;
  reservations: CreateReservationDto[];
}
