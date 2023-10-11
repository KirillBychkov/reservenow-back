import { Module } from '@nestjs/common';
import { RentalObjectService } from './rental_object.service';
import { RentalObjectController } from './rental_object.controller';
import { OrganizationModule } from 'src/organization/organization.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RentalObject } from './entities/rental_object.entity';
import { AccountModule } from 'src/account/account.module';
import { StorageModule } from 'src/storage/storage.module';

@Module({
  imports: [
    AccountModule,
    StorageModule,
    OrganizationModule,
    TypeOrmModule.forFeature([RentalObject]),
  ],
  controllers: [RentalObjectController],
  providers: [RentalObjectService],
  exports: [RentalObjectService],
})
export class RentalObjectModule {}
