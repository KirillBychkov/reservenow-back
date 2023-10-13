import { PartialType } from '@nestjs/swagger';
import UserDto from './user.dto';

export default class UpdateUserDto extends PartialType(UserDto) {
  image: string;
}
