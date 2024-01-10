import { Module } from '@nestjs/common';
import { ClientService } from './client.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Client } from './entities/client.entity';
import { UserModule } from 'src/user/user.module';
import { ClientController } from './client.controller';
import { AccountModule } from 'src/account/account.module';
import { RoleModule } from 'src/role/role.module';
import { ReservationModule } from 'src/reservation/reservation.module';
import { ExportModule } from 'src/export/export.module';

@Module({
  imports: [
    ExportModule,
    AccountModule,
    UserModule,
    ReservationModule,
    RoleModule,
    TypeOrmModule.forFeature([Client]),
  ],
  controllers: [ClientController],
  providers: [ClientService],
  exports: [ClientService],
})
export class ClientModule {}
