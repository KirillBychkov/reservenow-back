import * as bcrypt from 'bcrypt';
import { Injectable, NotAcceptableException } from '@nestjs/common';
import { AccountService } from 'src/account/account.service';
import { TokenService } from 'src/token/token.service';
import ChangeDto from './dto/change-password.dto';
import ConfirmPasswordDto from './dto/confirm-password.dto';
import { DateTime } from 'luxon';

@Injectable()
export class PasswordService {
  constructor(
    private readonly accountService: AccountService,
    private readonly tokenService: TokenService,
  ) {}

  async changePassword(id: number, body: ChangeDto) {
    const { old_password, new_password } = body;
    const account = await this.accountService.getAccount(id, null, true);

    if (!bcrypt.compare(old_password, account.password))
      throw new NotAcceptableException('Passwords do not match');

    const newHashedPassword = await bcrypt.hash(new_password, 10);
    const accountRO = await this.accountService.updateAccount(id, { password: newHashedPassword });

    const payload = { id: account.id, email: account.email };

    const [access_token, refresh_token] = await Promise.all([
      this.tokenService.generateToken(payload, process.env.SECRET, 60 * 15),
      this.tokenService.generateToken(payload, process.env.REFRESH_SECRET, 60 * 60 * 24 * 15),
    ]);

    const expires_at = DateTime.utc().plus({ minutes: 15 }).toISO().slice(0, -1);

    this.tokenService.updateToken(account.id, { access_token, refresh_token, expires_at });

    return { access_token, refresh_token, accountRO };
  }

  async resetPassword(email: string) {
    const account = await this.accountService.getAccount(null, email);
    const reset_token = await this.tokenService.generateToken(
      { id: account.id, email },
      process.env.RESET_SECRET,
      60 * 10,
    );

    await this.tokenService.updateToken(account.id, { reset_token });

    return { reset_token };
  }

  async confirmReset(body: ConfirmPasswordDto, payload: any) {
    const hashedPass = await bcrypt.hash(body.new_password, 10);

    this.accountService.updateAccount(payload.id, { password: hashedPass });

    const [access_token, refresh_token] = await Promise.all([
      this.tokenService.generateToken(payload, process.env.SECRET, 60 * 15),
      this.tokenService.generateToken(payload, process.env.REFRESH_SECRET, 60 * 60),
    ]);

    await this.tokenService.updateToken(payload, {
      access_token,
      refresh_token,
      reset_token: null,
    });

    return { access_token, refresh_token, account: payload };
  }
}
