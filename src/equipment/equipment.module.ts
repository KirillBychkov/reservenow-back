import { Module } from '@nestjs/common';
import { EquipmentService } from './equipment.service';
import { EquipmentController } from './equipment.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Equipment } from './entities/equipment.entity';
import { AccountModule } from 'src/account/account.module';
import { RoleModule } from 'src/role/role.module';

@Module({
  imports: [AccountModule, RoleModule, TypeOrmModule.forFeature([Equipment])],
  controllers: [EquipmentController],
  providers: [EquipmentService],
  exports: [EquipmentService],
})
export class EquipmentModule {}
