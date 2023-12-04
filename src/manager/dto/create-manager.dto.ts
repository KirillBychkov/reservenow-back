import { IsMobilePhone } from 'class-validator';

export class CreateManagerDto {
  email: string;
  first_name: string;
  last_name: string;

  @IsMobilePhone('uk-UA')
  phone: string;
  description?: string;
  hired_at?: Date;
  resigned_at?: Date;
}
