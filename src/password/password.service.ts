import * as bcrypt from 'bcrypt';
import { Injectable, NotAcceptableException } from '@nestjs/common';
import { AccountService } from 'src/account/account.service';
import { TokenService } from 'src/token/token.service';

@Injectable()
export class PasswordService {
  constructor(
    private readonly accountService: AccountService,
    private readonly tokenService: TokenService,
  ) {}

  async changePassword(id: number, oldPassword: string, newPassword: string) {
    const account = await this.accountService.getAccount(id, null, true);

    if (!bcrypt.compare(oldPassword, account.password)) throw new NotAcceptableException('Passwords do not match');

    const newHashedPassword = await bcrypt.hash(newPassword, 10);
    account.password = newHashedPassword;

    const accountRO = await this.accountService.updateAccount(id, {
      password: newHashedPassword,
    });

    const updatedTokens = await this.tokenService.generateTokens({
      id: account.id,
    });

    return { ...updatedTokens, accountRO };
  }

  async resetPassword(email: string) {
    const account = await this.accountService.getAccount(null, email);
    const reset_token = await this.tokenService.generateToken(
      { id: account.id, email },
      process.env.RESET_SECRET,
      60 * 10,
    );

    await this.tokenService.createOrUpdateToken(account, {
      reset_token: reset_token,
    });

    return { reset_token };
  }

  async confirmReset(newPassword: string, payload: any) {
    const hashedPass = await bcrypt.hash(newPassword, 10);

    this.accountService.updateAccount(payload.id, {
      password: hashedPass,
    });

    const [access_token, refresh_token] = await Promise.all([
      this.tokenService.generateToken(payload, process.env.SECRET, 60 * 15),
      this.tokenService.generateToken(payload, process.env.REFRESH_SECRET, 60 * 60),
    ]);

    await this.tokenService.createOrUpdateToken(payload, {
      access_token,
      refresh_token,
      reset_token: null,
    });

    return {
      access_token,
      refresh_token,
      account: payload,
    };
  }
}
