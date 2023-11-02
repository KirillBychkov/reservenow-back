import { Module } from '@nestjs/common';
import { SupportService } from './support.service';
import { SupportController } from './support.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Support } from './entities/support.entity';
import { AccountModule } from 'src/account/account.module';
import { UserModule } from 'src/user/user.module';
import { StorageModule } from 'src/storage/storage.module';
import { RoleModule } from 'src/role/role.module';

@Module({
  imports: [
    StorageModule,
    UserModule,
    RoleModule,
    AccountModule,
    TypeOrmModule.forFeature([Support]),
  ],
  controllers: [SupportController],
  providers: [SupportService],
})
export class SupportModule {}
