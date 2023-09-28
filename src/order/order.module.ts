import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { UserModule } from 'src/user/user.module';
import { ClientModule } from 'src/client/client.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { AccountModule } from 'src/account/account.module';

@Module({
  imports: [AccountModule, UserModule, ClientModule, TypeOrmModule.forFeature([Order])],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}
