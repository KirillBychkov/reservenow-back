import { ForbiddenException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Token } from './entities/token.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateTokenDto } from './dto/create-token.dto';
import { UpdateTokenDto } from './dto/update-token.dto';
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

  async refresh(payload) {
    const token = await this.getToken(payload);

    if (!token.refresh_token) throw new ForbiddenException();

    const [access_token, refresh_token] = await Promise.all([
      this.generateToken(payload, process.env.SECRET, 60 * 15),
      this.generateToken(payload, process.env.REFRESH_SECRET, 60 * 60 * 24 * 15),
    ]);
    await this.updateToken(payload.id, { access_token, refresh_token });

    return { access_token, refresh_token, account: payload };
  }
}
