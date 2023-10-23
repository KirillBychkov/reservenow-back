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
import { EquipmentModule } from './equipment/equipment.module';
import { TrainerModule } from './trainer/trainer.module';
import { OrderModule } from './order/order.module';
import { ClientModule } from './client/client.module';
import { StorageModule } from './storage/storage.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { LoggingInterceptor } from './logging/logging.interceptor';
import { Log } from './logging/entities/log.entity';
import { LoggingController } from './logging/logging.controller';
import { LoggingService } from './logging/logging.service';

@Module({
  imports: [
    UserModule,
    AuthModule,
    AccountModule,
    EquipmentModule,
    TokenModule,
    PasswordModule,
    MailModule,
    RoleModule,
    SupportModule,
    OrganizationModule,
    RentalObjectModule,
    ManagerModule,
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([Log]),
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({ useFactory: () => dataSourceOptions }),
    TrainerModule,
    OrderModule,
    ClientModule,
    StorageModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    LoggingService,
  ],
  controllers: [LoggingController],
})
export class AppModule {}
