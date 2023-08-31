import { Module } from '@nestjs/common';
import { SupportService } from './support.service';
import { SupportController } from './support.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Support } from './entities/support.entity';
import { AccountModule } from 'src/account/account.module';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [UserModule, AccountModule, TypeOrmModule.forFeature([Support])],
  controllers: [SupportController],
  providers: [SupportService],
})
export class SupportModule {}
