import { IsNotEmpty } from 'class-validator';

export default class ChangePasswordDto {
  @IsNotEmpty()
  old_password: string;
  @IsNotEmpty()
  new_password: string;
}
