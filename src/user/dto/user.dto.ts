import { IsLowercase, IsMobilePhone, Matches } from 'class-validator';

export default class UserDto {
  first_name: string;
  last_name: string;

  @IsMobilePhone('uk-UA')
  phone: string;

  @IsLowercase()
  @Matches(/^[a-zA-Z1-9]*$/, {
    message: 'domain_url must contain only English letters',
  })
  domain_url: string;
  description?: string;
}
