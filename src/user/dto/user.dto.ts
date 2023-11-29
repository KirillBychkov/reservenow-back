import { IsMobilePhone } from 'class-validator';

export default class UserDto {
  first_name: string;
  last_name: string;

  @IsMobilePhone('uk-UA')
  phone: string;

  domain_url: string;
  description?: string;
}
