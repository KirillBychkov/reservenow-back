import { IsMobilePhone } from 'class-validator';

export class FindByPhoneQueryDto {
  @IsMobilePhone('uk-UA')
  phone: string;
}
