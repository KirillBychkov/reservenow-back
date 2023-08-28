import { Module } from '@nestjs/common';
import { PasswordService } from './password.service';
import { PasswordController } from './password.controller';
import { AccountModule } from 'src/account/account.module';
import { TokenModule } from 'src/token/token.module';

@Module({
  imports: [AccountModule, TokenModule],
  providers: [PasswordService],
  controllers: [PasswordController],
})
export class PasswordModule {}
