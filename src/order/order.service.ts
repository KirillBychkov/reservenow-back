import { Injectable } from '@nestjs/common';
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

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order) private readonly orderRepository: Repository<Order>,
    private readonly equipmentService: EquipmentService,
    private readonly trainerService: TrainerService,
    private readonly rentalObjectService: RentalObjectService,
    private readonly dataSource: DataSource,
  ) {}

  async create(userId: number, createOrderDto: CreateOrderDto) {
    const { client, reservations } = createOrderDto;

    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const newClient = await queryRunner.manager.save(Client, client);

      const order = await queryRunner.manager.save(Order, {
        user: { id: userId },
        client: { id: newClient.id },
      });

      await Promise.all(
        reservations.map(async (reservationDto) => {
          const {
            equipment_id,
            rental_object_id,
            trainer_id,
            reservation_time_start,
            reservation_time_end,
          } = reservationDto;

          const reservationStart = DateTime.fromSQL(reservation_time_start.toString());
          const reservationEnd = DateTime.fromSQL(reservation_time_end.toString());

          console.log(reservationStart, reservationEnd);

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

          queryRunner.manager.insert(Reservation, {
            user: { id: userId },
            equipment: equipment_id ? { id: equipment_id } : null,
            rental_object: rental_object_id ? { id: rental_object_id } : null,
            trainer: trainer_id ? { id: trainer_id } : null,
            reservation_time_start,
            reservation_time_end,
            price: Math.floor(objectToRent.price_per_hour * timeDifference),
            order: { id: order.id },
          });
        }),
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

  findAll(userId: number): Promise<Order[]> {
    const query = this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.reservations', 'reservation');

    if (userId) {
      query.where('order.user.id = :userId', { userId });
    }

    return query.getMany();
  }

  findOne(id: number) {
    return this.orderRepository.findOneBy({ id });
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
