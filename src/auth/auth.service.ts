import * as bcrypt from 'bcrypt';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AccountService } from 'src/account/account.service';
import { Account, AccountStatus } from 'src/account/entities/account.entity';
import { TokenService } from 'src/token/token.service';
import SignInDTO from './dto/signin.dto';
import { DateTime } from 'luxon';
import AuthDto from './dto/auth.dto';
import ConfirmPasswordDto from 'src/password/dto/confirm-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly accountService: AccountService,
    private readonly tokenService: TokenService,
  ) {}

  async login(signInDTO: SignInDTO): Promise<AuthDto> {
    const { email, password } = signInDTO;
    const numberOfAccounts = await this.accountService.getCount();

    if (numberOfAccounts === 0) await this.accountService.createSuperUserAccount(email, password);
    const account: Account = await this.accountService.getAccount(null, email, true);

    if (!(await bcrypt.compare(password, account.password)))
      throw new UnauthorizedException('Wrong password');

    const payload = {
      id: account.id,
      email: account.email,
      user_id: account.user?.id,
      role_id: account.role?.id,
    };

    const [access_token, refresh_token] = await Promise.all([
      this.tokenService.generateToken(payload, process.env.SECRET, 60 * 15),
      this.tokenService.generateToken(payload, process.env.REFRESH_SECRET, 60 * 60 * 24 * 15),
    ]);

    const expires_at = DateTime.utc().plus({ days: 15 }).toISO().slice(0, -1);

    const token = { access_token, refresh_token, expires_at };

    if (!(await this.tokenService.getToken(account.id))) {
      await this.tokenService.createToken(account.id, token);
    } else {
      await this.tokenService.updateToken(account.id, token);
    }

    delete account.password;

    return { access_token, refresh_token, account };
  }

  async verify(body: ConfirmPasswordDto, payload: any) {
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
      verify_token: null,
    });

    return { access_token, refresh_token, account: payload };
  }

  async logout(id) {
    const account = await this.accountService.getAccount(id, null);

    await this.tokenService.updateToken(account.id, {
      access_token: null,
      refresh_token: null,
      expires_at: null,
    });
  }

  getAccount(accountId): Promise<Account> {
    return this.accountService.getAccount(accountId, null);
  }
}
