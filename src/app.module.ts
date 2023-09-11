import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountModule } from './account/account.module';
import { TokenModule } from './token/token.module';
import { PasswordModule } from './password/password.module';
import { MailModule } from './mail/mail.module';
import { RoleModule } from './role/role.module';
import { SupportModule } from './support/support.module';
import { dataSourceOptions } from 'db/typeorm.config';
import { OrganizationModule } from './organization/organization.module';
import { RentalObjectModule } from './rental_object/rental_object.module';
import { ManagerModule } from './manager/manager.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    UserModule,
    AuthModule,
    AccountModule,
    TokenModule,
    PasswordModule,
    MailModule,
    RoleModule,
    SupportModule,
    OrganizationModule,
    RentalObjectModule,
    ManagerModule,
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({ useFactory: () => dataSourceOptions }),
  ],
})
export class AppModule {}
