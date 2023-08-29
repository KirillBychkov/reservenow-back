import { Module } from '@nestjs/common';
import { TokenService } from './token.service';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Token } from './entities/token.entity';
import { RtStrategy } from './strategies/rt.strategy';
import { AtStrategy } from './strategies/at.strategy';
import { RstStrategy } from './strategies/rst.strategy';
import { TokenController } from './token.controller';

@Module({
  imports: [JwtModule, TypeOrmModule.forFeature([Token])],
  providers: [TokenService, RtStrategy, AtStrategy, RstStrategy],
  exports: [TokenService],
  controllers: [TokenController],
})
export class TokenModule {}
