import { ForbiddenException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Token } from './entities/token.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Account } from 'src/account/entities/account.entity';

@Injectable()
export class TokenService {
  constructor(
    @InjectRepository(Token)
    private readonly tokenRepository: Repository<Token>,
    private readonly jwtService: JwtService,
  ) {}
  async createOrUpdateToken(account: Account, tokens: any) {
    return this.tokenRepository.upsert({ account, ...tokens }, ['account']);
  }

  async getToken(accountId) {
    return this.tokenRepository.findOneBy({ account: { id: accountId } });
  }
  generateToken(payload: any, secret: string, exp: number) {
    return this.jwtService.signAsync(payload, {
      secret: secret,
      expiresIn: exp,
    });
  }

  async refresh(payload) {
    const token = await this.getToken(payload);

    if (!token.refresh_token) throw new ForbiddenException();

    const [access_token, refresh_token] = await Promise.all([
      this.generateToken(payload, process.env.SECRET, 60 * 15),
      this.generateToken(payload, process.env.REFRESH_SECRET, 60 * 60 * 24 * 15),
    ]);
    await this.createOrUpdateToken(payload, { access_token, refresh_token });

    return { access_token, refresh_token, account: payload };
  }
}
