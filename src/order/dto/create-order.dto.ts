import { CreateClientDto } from 'src/client/dto/create-client.dto';
import { CreateReservationDto } from 'src/reservation/dto/create-reservation.dto';
import { OrderPaymentMethod, OrderStatus } from '../entities/order.entity';

export class CreateOrderDto {
  client: CreateClientDto;
  reservations: CreateReservationDto[];
  status: OrderStatus;
  payment_method: OrderPaymentMethod;
}
