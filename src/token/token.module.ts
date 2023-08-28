import { Module } from '@nestjs/common';
import { TokenService } from './token.service';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Token } from './entities/token.entity';
import { RtStrategy } from './strategies/rt.strategy';
import { AtStrategy } from './strategies/at.strategy';

@Module({
  imports: [JwtModule, TypeOrmModule.forFeature([Token])],
  providers: [TokenService, RtStrategy, AtStrategy],
  exports: [TokenService],
})
export class TokenModule {}
