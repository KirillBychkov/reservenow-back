import { Module } from '@nestjs/common';
import { TrainerService } from './trainer.service';
import { TrainerController } from './trainer.controller';
import { UserModule } from 'src/user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Trainer } from './entities/trainer.entity';
import { AccountModule } from 'src/account/account.module';
import { RoleModule } from 'src/role/role.module';
import { TokenModule } from 'src/token/token.module';

@Module({
  imports: [
    TokenModule,
    RoleModule,
    UserModule,
    AccountModule,
    TypeOrmModule.forFeature([Trainer]),
  ],
  controllers: [TrainerController],
  providers: [TrainerService],
  exports: [TrainerService],
})
export class TrainerModule {}
