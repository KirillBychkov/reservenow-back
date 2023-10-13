import { PartialType } from '@nestjs/swagger';
import { CreateRentalObjectDto } from './create-rental_object.dto';

export class UpdateRentalObjectDto extends PartialType(CreateRentalObjectDto) {
  photo?: string;
}
