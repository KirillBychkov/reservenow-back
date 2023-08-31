import { IsEmail, IsNotEmpty } from 'class-validator';

export default class SignInDTO {
  @IsEmail()
  email: string;
  @IsNotEmpty()
  password: string;
}
