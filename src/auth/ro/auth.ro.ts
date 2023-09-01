import { ApiProperty } from '@nestjs/swagger';
import { Account } from 'src/account/entities/account.entity';

export default class AuthRo {
  @ApiProperty()
  access_token: string;
  @ApiProperty()
  refresh_token: string;
  @ApiProperty()
  account: Account;
}
