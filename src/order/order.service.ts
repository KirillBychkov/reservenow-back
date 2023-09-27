import { Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { DataSource, Repository } from 'typeorm';
import { ClientService } from 'src/client/client.service';
import { UserService } from 'src/user/user.service';
import { Reservation } from 'src/reservation/entities/reservation.entity';
import { Client } from 'src/client/entities/client.entity';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order) private readonly orderRepository: Repository<Order>,
    private readonly userService: UserService,
    private readonly clientService: ClientService,
    private readonly dataSource: DataSource,
  ) {}

  async create(createOrderDto: CreateOrderDto) {
    const { user_id, client, reservations } = createOrderDto;

    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // await Promise.all([this.userService.findOne(user_id), this.clientService.findOne(client_id)]);

      const newClient = await queryRunner.manager.insert(Client, client);

      const order = await queryRunner.manager.insert(Order, {
        user: { id: user_id },
        client: { id: newClient.raw.id },
      });

      await Promise.all(
        reservations.map((reservation) =>
          queryRunner.manager.insert(Reservation, { ...reservation, order: { id: order.raw.id } }),
        ),
      );

      await queryRunner.commitTransaction();
      return order;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  findAll(): Promise<Order[]> {
    return this.orderRepository.find();
  }

  findOne(id: number) {
    return this.orderRepository.findOneBy({ id });
  }

  update(id: number, updateOrderDto: UpdateOrderDto) {
    return `This action updates a #${id} order`;
  }

  remove(id: number) {
    return this.orderRepository.delete({ id });
  }
}
