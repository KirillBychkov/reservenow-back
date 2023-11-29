import { IsMobilePhone } from 'class-validator';

export class CreateClientDto {
  first_name: string;
  last_name: string;

  @IsMobilePhone('uk-UA')
  phone: string;

  description: string;
}
