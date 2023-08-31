import { IsEmail } from 'class-validator';

export default class ResetPasswordDto {
  @IsEmail()
  email: string;
}
