import * as bcrypt from 'bcrypt';
import { Injectable } from '@nestjs/common';
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
  async createOrUpdateToken(account: Account, refreshToken: string) {
    const hashedRt = refreshToken ? await bcrypt.hash(refreshToken, 10) : null;
    return this.tokenRepository.upsert({ account, refresh_token: hashedRt }, [
      'account',
    ]);
  }

  async getToken(account: Account) {
    return this.tokenRepository.findOneBy({ account });
  }

  async generateTokens(payload) {
    const [access_token, refresh_token] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: process.env.SECRET,
        expiresIn: 60 * 15,
      }),
      this.jwtService.signAsync(payload, {
        secret: process.env.REFRESH_SECRET,
        expiresIn: 60 * 60 * 24 * 15,
      }),
    ]);

    return { access_token, refresh_token };
  }
}
