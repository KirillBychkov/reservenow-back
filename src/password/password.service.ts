import * as bcrypt from 'bcrypt';
import { Injectable, NotAcceptableException } from '@nestjs/common';
import { AccountService } from 'src/account/account.service';
import { Account } from 'src/account/entities/account.entity';
import { TokenService } from 'src/token/token.service';

@Injectable()
export class PasswordService {
  constructor(
    private readonly accountService: AccountService,
    private readonly tokenService: TokenService,
  ) {}
  async changePassword(
    email: string,
    old_password: string,
    new_password: string,
  ) {
    const account: Account = await this.accountService.getAccount(email, true);

    if (!bcrypt.compare(old_password, account.password))
      throw new NotAcceptableException('Passwords do not match');

    const newHashedPassword = await bcrypt.hash(new_password, 10);
    account.password = newHashedPassword;

    const accountRO = await this.accountService.updateAccount(account);

    const updatedTokens = await this.tokenService.generateTokens({
      id: account.id,
      email: account.email,
    });

    return { ...updatedTokens, accountRO };
  }
}
