import { CreateClientDto } from 'src/client/dto/create-client.dto';
import { CreateReservationDto } from 'src/reservation/dto/create-reservation.dto';
import { OrderPaymentMethod, OrderStatus } from '../entities/order.entity';
import { ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateOrderDto {
  @ValidateNested()
  @Type(() => CreateClientDto)
  client: CreateClientDto;
  reservations: CreateReservationDto[];
  status: OrderStatus;
  payment_method: OrderPaymentMethod;
}
