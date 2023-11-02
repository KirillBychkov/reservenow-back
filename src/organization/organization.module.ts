import { Module } from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { OrganizationController } from './organization.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Organization } from './entities/organization.entity';
import { AccountModule } from 'src/account/account.module';
import { StorageModule } from 'src/storage/storage.module';
import { RoleModule } from 'src/role/role.module';

@Module({
  imports: [AccountModule, StorageModule, RoleModule, TypeOrmModule.forFeature([Organization])],
  controllers: [OrganizationController],
  providers: [OrganizationService],
  exports: [OrganizationService],
})
export class OrganizationModule {}
