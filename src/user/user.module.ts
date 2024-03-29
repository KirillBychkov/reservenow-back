import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { AccountModule } from 'src/account/account.module';
import { TokenModule } from 'src/token/token.module';
import { RoleModule } from 'src/role/role.module';
import { StorageModule } from 'src/storage/storage.module';
import { MailModule } from 'src/mail/mail.module';
import { ExportModule } from 'src/export/export.module';

@Module({
  imports: [
    ExportModule,
    MailModule,
    RoleModule,
    StorageModule,
    TokenModule,
    AccountModule,
    TypeOrmModule.forFeature([User]),
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
