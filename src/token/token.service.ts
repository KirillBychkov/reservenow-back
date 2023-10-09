import { ForbiddenException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Token } from './entities/token.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateTokenDto } from './dto/create-token.dto';
import { UpdateTokenDto } from './dto/update-token.dto';
import { Cron, CronExpression } from '@nestjs/schedule';
import AuthDto from 'src/auth/dto/auth.dto';
import { Account } from 'src/account/entities/account.entity';
import { DateTime } from 'luxon';
// import { Account } from 'src/account/entities/account.entity';

@Injectable()
export class TokenService {
  constructor(
    @InjectRepository(Token)
    private readonly tokenRepository: Repository<Token>,
    private readonly jwtService: JwtService,
  ) {}

  getToken(accountId) {
    return this.tokenRepository.findOneBy({ account: { id: accountId } });
  }
  createToken(accountId: number, token: CreateTokenDto) {
    return this.tokenRepository.insert({ account: { id: accountId }, ...token });
  }

  updateToken(accountId: number, token: UpdateTokenDto) {
    return this.tokenRepository.update({ account: { id: accountId } }, token);
  }

  generateToken(payload: any, secret: string, exp: number) {
    return this.jwtService.signAsync(payload, { secret, expiresIn: exp });
  }

  async refresh(payload: Account): Promise<AuthDto> {
    const token = await this.getToken(payload.id);

    if (!token.refresh_token) throw new ForbiddenException();

    const [access_token, refresh_token] = await Promise.all([
      this.generateToken(payload, process.env.SECRET, 60 * 15),
      this.generateToken(payload, process.env.REFRESH_SECRET, 60 * 60 * 24 * 15),
    ]);

    const expires_at = DateTime.utc().plus({ days: 15 }).toISO().slice(0, -1);

    await this.updateToken(payload.id, { access_token, refresh_token, expires_at });

    return { access_token, refresh_token, account: payload };
  }

  @Cron(CronExpression.EVERY_10_MINUTES)
  async removeExpiredTokens() {
    this.tokenRepository
      .createQueryBuilder()
      .delete()
      .where('expires_at < now()')
      .orWhere(
        `access_token IS NULL AND 
        refresh_token IS NULL AND 
        reset_token IS NULL AND 
        verify_token IS NULL`,
      )
      .execute();
  }
}
