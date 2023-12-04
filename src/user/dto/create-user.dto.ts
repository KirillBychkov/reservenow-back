import { IsEmail, ValidateNested } from 'class-validator';
import UserDto from './user.dto';
import { Type } from 'class-transformer';

export default class CreateUserDto {
  @IsEmail()
  email: string;

  @ValidateNested()
  @Type(() => UserDto)
  user?: UserDto;
}
