import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { AccountModule } from 'src/account/account.module';
import { TokenModule } from 'src/token/token.module';

@Module({
  imports: [AccountModule, TokenModule, JwtModule.register({})],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
