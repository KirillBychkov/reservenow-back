import { CreateClientDto } from 'src/client/dto/create-client.dto';
import { CreateReservationDto } from 'src/reservation/dto/create-reservation.dto';

export class CreateOrderDto {
  client: CreateClientDto;
  reservations: CreateReservationDto[];
}
