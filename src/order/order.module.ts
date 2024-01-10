import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { AccountModule } from 'src/account/account.module';
import { EquipmentModule } from 'src/equipment/equipment.module';
import { TrainerModule } from 'src/trainer/trainer.module';
import { RentalObjectModule } from 'src/rental_object/rental_object.module';
import { RoleModule } from 'src/role/role.module';
import { ClientModule } from 'src/client/client.module';
import { ExportModule } from 'src/export/export.module';

@Module({
  imports: [
    ExportModule,
    AccountModule,
    EquipmentModule,
    RoleModule,
    TrainerModule,
    ClientModule,
    RentalObjectModule,
    TypeOrmModule.forFeature([Order]),
  ],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}
