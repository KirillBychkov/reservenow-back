import { Module } from '@nestjs/common';
import { TrainerService } from './trainer.service';
import { TrainerController } from './trainer.controller';
import { UserModule } from 'src/user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Trainer } from './entities/trainer.entity';
import { AccountModule } from 'src/account/account.module';

@Module({
  imports: [UserModule, AccountModule, TypeOrmModule.forFeature([Trainer])],
  controllers: [TrainerController],
  providers: [TrainerService],
})
export class TrainerModule {}
