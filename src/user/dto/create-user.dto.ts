import { IsEmail } from 'class-validator';
import UserDto from './user.dto';

export default class CreateUserDto {
  @IsEmail()
  email: string;
  user: UserDto;
}
