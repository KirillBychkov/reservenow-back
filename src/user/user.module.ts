import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { AccountModule } from 'src/account/account.module';
import { TokenModule } from 'src/token/token.module';
import { RoleModule } from 'src/role/role.module';

@Module({
  imports: [RoleModule, TokenModule, AccountModule, TypeOrmModule.forFeature([User])],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
