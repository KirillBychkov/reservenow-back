import { PartialType } from '@nestjs/swagger';
import { CreateClientDto } from './create-client.dto';
import { ClientStatus } from '../entities/client.entity';

export class UpdateClientDto extends PartialType(CreateClientDto) {
  status: ClientStatus;
}
