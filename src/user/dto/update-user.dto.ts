import { PartialType } from '@nestjs/swagger';
import UserDto from './user.dto';

export default class UpdateUserDto extends PartialType(UserDto) {
  first_name: string;
  last_name: string;
  phone: string;
  domain_url: string;
  image: string;
  description: string;
}
