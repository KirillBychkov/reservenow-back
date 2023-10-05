import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { AccountModule } from 'src/account/account.module';
import { EquipmentModule } from 'src/equipment/equipment.module';
import { TrainerModule } from 'src/trainer/trainer.module';
import { RentalObjectModule } from 'src/rental_object/rental_object.module';

@Module({
  imports: [
    AccountModule,
    EquipmentModule,
    TrainerModule,
    RentalObjectModule,
    TypeOrmModule.forFeature([Order]),
  ],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}
