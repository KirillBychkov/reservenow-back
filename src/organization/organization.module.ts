import { Module } from '@nestjs/common';
import { OrganizationController } from './organization.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Organization } from './entities/organization.entity';
import { AccountModule } from 'src/account/account.module';
import { StorageModule } from 'src/storage/storage.module';
import { RoleModule } from 'src/role/role.module';
import { OrganizationService } from './organization.service';

@Module({
  imports: [AccountModule, StorageModule, RoleModule, TypeOrmModule.forFeature([Organization])],
  controllers: [OrganizationController],
  providers: [OrganizationService],
  exports: [OrganizationService],
})
export class OrganizationModule {}
