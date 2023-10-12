import { Module } from '@nestjs/common';
import { ManagerService } from './manager.service';
import { ManagerController } from './manager.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Manager } from './entities/manager.entity';
import { AccountModule } from 'src/account/account.module';
import { UserModule } from 'src/user/user.module';
import { StorageModule } from 'src/storage/storage.module';

@Module({
  imports: [AccountModule, UserModule, StorageModule, TypeOrmModule.forFeature([Manager])],
  controllers: [ManagerController],
  providers: [ManagerService],
})
export class ManagerModule {}
