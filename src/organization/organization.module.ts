import { Module } from '@nestjs/common';
import { OrganizationController } from './organization.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Organization } from './entities/organization.entity';
import { AccountModule } from 'src/account/account.module';
import { StorageModule } from 'src/storage/storage.module';
import { RoleModule } from 'src/role/role.module';
import { OrganizationService } from './organization.service';
import { ClientModule } from 'src/client/client.module';
import { Client } from 'src/client/entities/client.entity';
import { ReservationModule } from 'src/reservation/reservation.module';
import { OrganizationStatistic } from './entities/organizationStatistic.entity';

@Module({
  imports: [
    AccountModule,
    StorageModule,
    RoleModule,
    ClientModule,
    ReservationModule,
    TypeOrmModule.forFeature([Organization, OrganizationStatistic, Client]),
  ],
  controllers: [OrganizationController],
  providers: [OrganizationService],
  exports: [OrganizationService],
})
export class OrganizationModule {}
