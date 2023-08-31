import { IsNotEmpty } from 'class-validator';

export default class ConfirmPasswordDto {
  @IsNotEmpty()
  new_password: string;
}
