import * as bcrypt from 'bcrypt';
import { Injectable, NotAcceptableException } from '@nestjs/common';
import { AccountService } from 'src/account/account.service';
import { TokenService } from 'src/token/token.service';
import ChangeDto from './dto/change-password.dto';
import ConfirmPasswordDto from './dto/confirm-password.dto';
import { AccountStatus } from 'src/account/entities/account.entity';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class PasswordService {
  constructor(
    private readonly accountService: AccountService,
    private readonly tokenService: TokenService,
    private readonly mailService: MailService,
  ) {}

  async changePassword(id: number, body: ChangeDto) {
    const { old_password, new_password } = body;
    const account = await this.accountService.getAccount(id, null, true);

    if (!bcrypt.compare(old_password, account.password))
      throw new NotAcceptableException('Passwords do not match');

    const newHashedPassword = await bcrypt.hash(new_password, 10);
    return this.accountService.update(id, { password: newHashedPassword });
  }

  async resetPassword(email: string) {
    const account = await this.accountService.getAccount(null, email);
    const reset_token = await this.tokenService.generateToken(
      { id: account.id, email },
      process.env.RESET_SECRET,
      60 * 10,
    );

    await this.tokenService.updateToken(account.id, { reset_token });

    await this.mailService.sendMail(
      email,
      'Password reset',
      '<p>Click <a href="http://127.0.0.1:5173/reset-password?reset_token=' +
        reset_token +
        '">here</a> to reset your password</p>',
    );

    return { reset_token };
  }

  async confirmReset(body: ConfirmPasswordDto, payload: any) {
    const hashedPass = await bcrypt.hash(body.new_password, 10);

    await this.accountService.update(payload.id, { password: hashedPass });

    const [access_token, refresh_token] = await Promise.all([
      this.tokenService.generateToken(payload, process.env.SECRET, 60 * 15),
      this.tokenService.generateToken(payload, process.env.REFRESH_SECRET, 60 * 60),
    ]);

    await this.accountService.update(payload.id, { status: AccountStatus.ACTIVE });

    await this.tokenService.updateToken(payload.id, {
      access_token,
      refresh_token,
      reset_token: null,
    });

    return { access_token, refresh_token, account: payload };
  }
}
