import { ConflictException, Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { DataSource, Repository } from 'typeorm';
import { Reservation } from 'src/reservation/entities/reservation.entity';
import { Client } from 'src/client/entities/client.entity';
import { EquipmentService } from 'src/equipment/equipment.service';
import { RentalObjectService } from 'src/rental_object/rental_object.service';
import { TrainerService } from 'src/trainer/trainer.service';
import { DateTime } from 'luxon';
import { Equipment } from 'src/equipment/entities/equipment.entity';
import { RentalObject } from 'src/rental_object/entities/rental_object.entity';
import { Trainer } from 'src/trainer/entities/trainer.entity';
import { ClientService } from 'src/client/client.service';
import ElementsQueryDto from './dto/query.dto';
import FindAllOrdersDto from './dto/find-all-orders.dto';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order) private readonly orderRepository: Repository<Order>,
    private readonly equipmentService: EquipmentService,
    private readonly trainerService: TrainerService,
    private readonly rentalObjectService: RentalObjectService,
    private readonly clientService: ClientService,
    private readonly dataSource: DataSource,
  ) {}

  async create(userId: number, createOrderDto: CreateOrderDto) {
    const { client, reservations, ...statusAndPaymentMathod } = createOrderDto;

    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const clientRecord =
        (await this.clientService.findOneByPhone(client.phone)) ??
        (await queryRunner.manager.save(Client, { ...client, userId }));

      const order = await queryRunner.manager.save(Order, {
        user: { id: userId },
        client: { id: clientRecord.id },
        ...statusAndPaymentMathod,
      });

      let order_sum = 0;

      await Promise.all(
        reservations.map(async (reservationDto) => {
          const {
            equipment_id,
            rental_object_id,
            trainer_id,
            reservation_time_start,
            reservation_time_end,
          } = reservationDto;

          const reservationStart = DateTime.fromISO(reservation_time_start.toString());
          const reservationEnd = DateTime.fromISO(reservation_time_end.toString());

          const timeDifference =
            reservationEnd.diff(reservationStart, 'minutes').toObject().minutes / 60;

          let objectToRent: Equipment | RentalObject | Trainer;
          if (equipment_id) {
            objectToRent = await this.equipmentService.findOne(equipment_id);
          } else if (rental_object_id) {
            objectToRent = await this.rentalObjectService.findOne(rental_object_id);
          } else if (trainer_id) {
            objectToRent = await this.trainerService.findOne(trainer_id);
          }

          const price = Math.floor(objectToRent.price_per_hour * timeDifference);
          order_sum += price;

          queryRunner.manager.insert(Reservation, {
            user: { id: userId },
            equipment: equipment_id ? { id: equipment_id } : null,
            rental_object: rental_object_id ? { id: rental_object_id } : null,
            trainer: trainer_id ? { id: trainer_id } : null,
            reservation_time_start,
            reservation_time_end,
            price,
            order: { id: order.id },
          });

          queryRunner.manager.update(Order, { id: order.id }, { order_sum });
        }),
      );

      await queryRunner.commitTransaction();

      return await this.findOne(order.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error.code === '23505')
        throw new ConflictException(`Client with phone number '${client.phone}' already exists`);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(query: ElementsQueryDto, userId: number): Promise<FindAllOrdersDto> {
    const { rental_object_id, equipment_id, trainer_id, limit, skip, sort } = query;

    const sortFilters = (sort == undefined ? 'created_at:1' : sort).split(':');

    const orderQuery = this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.reservations', 'reservation')
      .leftJoinAndSelect('order.user', 'user')
      .leftJoinAndSelect('order.client', 'client')
      .leftJoinAndSelect('reservation.equipment', 'equipment')
      .leftJoinAndSelect('reservation.rental_object', 'rental_object')
      .leftJoinAndSelect('reservation.trainer', 'trainer')
      .orderBy(`order.${sortFilters[0]}`, sortFilters[1] === '1' ? 'ASC' : 'DESC')
      .skip(skip ?? 0)
      .take(limit ?? 10);

    if (userId) orderQuery.where('order.user.id = :userId', { userId });
    if (equipment_id) orderQuery.andWhere('equipment.id = :equipment_id', { equipment_id });
    if (trainer_id) orderQuery.andWhere('trainer.id = :trainer_id', { trainer_id });
    if (rental_object_id)
      orderQuery.andWhere('rental_object.id = :rental_object_id', { rental_object_id });

    const orders = await orderQuery.getManyAndCount();

    return {
      filters: { skip, limit, total: orders[1], received: orders[0].length },
      data: orders[0],
    };
  }

  findOne(id: number) {
    return this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.reservations', 'reservation')
      .leftJoinAndSelect('order.user', 'user')
      .leftJoinAndSelect('order.client', 'client')
      .where('order.id = :id', { id })
      .getOne();
  }

  async update(id: number, updateOrderDto: UpdateOrderDto) {
    const updated = await this.orderRepository
      .createQueryBuilder()
      .update(Order, updateOrderDto)
      .where('id = :id', { id })
      .returning('*')
      .execute();
    return updated.raw;
  }

  remove(id: number) {
    return this.orderRepository.delete({ id });
  }
}
