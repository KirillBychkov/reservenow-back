import * as bcrypt from 'bcrypt';
import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import SignInDTO from './dto/signin.dto';
import { AccountService } from 'src/account/account.service';
import { Account } from 'src/account/entities/account.entity';
import { TokenService } from 'src/token/token.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly accountService: AccountService,
    private readonly tokenService: TokenService,
  ) {}

  async login(signInDTO: SignInDTO) {
    const { email, password } = signInDTO;
    const numberOfAccounts = await this.accountService.getCount();

    const account: Account = await (numberOfAccounts === 0
      ? this.accountService.createAccount(email, password)
      : this.accountService.getAccount(email, true));

    if (!(await bcrypt.compare(password, account.password)))
      throw new UnauthorizedException();

    const payload = { id: account.id, email: account.email };
    const tokens = await this.tokenService.generateTokens(payload);
    const accountRO = await this.tokenService.createOrUpdateToken(
      account,
      tokens.refresh_token,
    );

    return { ...tokens, accountRO };
  }

  async logout(req) {
    const { email } = req.user;

    const account = await this.accountService.getAccount(email);

    await this.tokenService.createOrUpdateToken(account, null);

    return;
  }

  async refresh(req) {
    const { payload } = req.user;

    const token = await this.tokenService.getToken(payload);

    if (!token.refresh_token) throw new ForbiddenException();

    const newTokens = await this.tokenService.generateTokens(payload);

    await this.tokenService.createOrUpdateToken(
      payload,
      newTokens.refresh_token,
    );

    return { ...newTokens, account: req.user };
  }

  getUser(req) {
    const { email } = req.user;

    return this.accountService.getAccount(email);
  }
}
