import { Account } from 'src/account/entities/account.entity';

export default class AuthDto {
  access_token: string;
  refresh_token: string;
  account: Account;
}
