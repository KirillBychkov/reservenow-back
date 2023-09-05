import { IsEmail, IsNotEmpty } from 'class-validator';

export default class SignInDTO {
  @IsNotEmpty()
  @IsEmail()
  email: string;
  @IsNotEmpty()
  password: string;
}
