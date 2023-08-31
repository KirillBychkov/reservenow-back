import * as bcrypt from 'bcrypt';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AccountService } from 'src/account/account.service';
import { Account } from 'src/account/entities/account.entity';
import { TokenService } from 'src/token/token.service';
import SignInDTO from './dto/signin.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly accountService: AccountService,
    private readonly tokenService: TokenService,
  ) {}

  async login(signInDTO: SignInDTO) {
    const { email, password } = signInDTO;
    const numberOfAccounts = await this.accountService.getCount();

    if (numberOfAccounts === 0) await this.accountService.createSuperUserAccount(email, password);
    const account: Account = await this.accountService.getAccount(null, email, true);

    if (!(await bcrypt.compare(password, account.password))) throw new UnauthorizedException();

    const payload = { id: account.id, email: account.email, user_id: account.user?.id };

    const [access_token, refresh_token] = await Promise.all([
      this.tokenService.generateToken(payload, process.env.SECRET, 60 * 15),
      this.tokenService.generateToken(payload, process.env.REFRESH_SECRET, 60 * 60 * 24 * 15),
    ]);

    await this.tokenService.createOrUpdateToken(account, { access_token, refresh_token });

    return { access_token, refresh_token, account };
  }

  async logout(id) {
    const account = await this.accountService.getAccount(id, null);

    await this.tokenService.createOrUpdateToken(account, {
      access_token: null,
      refresh_token: null,
    });

    return;
  }

  async getUser(accountId) {
    const account = await this.accountService.getAccount(accountId, null);

    return account.user;
  }
}
