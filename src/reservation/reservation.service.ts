import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Reservation } from './entities/reservation.entity';
import { Brackets, Repository } from 'typeorm';
import ReservationQueryDto from 'src/client/dto/reservations-query.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import FindAllReservationsByClientDto from './dto/find-reservations-by-client.dto';

@Injectable()
export class ReservationService {
  constructor(
    @InjectRepository(Reservation) private readonly reservationRepository: Repository<Reservation>,
  ) {}

  async getReservationsByClientIdOrRentObjId(
    query: ReservationQueryDto,
    clientId: number,
    rentalObjectId?: number,
  ): Promise<FindAllReservationsByClientDto> {
    const { skip, limit, search, sort } = query;

    const sortFilters = (sort == undefined ? 'created_at:1' : sort).split(':');

    try {
      const reservationsQuery = this.reservationRepository
        .createQueryBuilder('reservation')
        .leftJoin('reservation.order', 'order')
        .leftJoinAndSelect('reservation.equipment', 'equipment')
        .leftJoinAndSelect('reservation.rental_object', 'rental_object')
        .leftJoinAndSelect('reservation.trainer', 'trainer')
        .andWhere(
          new Brackets((qb) => {
            qb.where(`CAST(reservation.id AS TEXT) ILIKE :search`, { search: `%${search ?? ''}%` })
              .orWhere(`equipment.name ILIKE :search`, { search: `%${search ?? ''}%` })
              .orWhere(`rental_object.name ILIKE :search`, { search: `%${search ?? ''}%` })
              .orWhere(`trainer.first_name || ' ' || trainer.last_name ILIKE :search`, {
                search: `%${search ?? ''}%`,
              });
          }),
        )
        .orderBy(`reservation.${sortFilters[0]}`, sortFilters[1] === '1' ? 'ASC' : 'DESC')
        .skip(skip ?? 0);

      if (clientId) reservationsQuery.where('order.client.id = :clientId', { clientId });
      if (rentalObjectId)
        reservationsQuery.andWhere('rental_object.id = :rentalObjectId', { rentalObjectId });
      if (limit !== -1) reservationsQuery.take(limit ?? 10);
      const reservations = await reservationsQuery.getManyAndCount();

      return {
        filters: { skip, limit, search, total: reservations[1], received: reservations[0].length },
        data: reservations[0],
      };
    } catch (error) {
      throw error;
    }
  }

  async findAll(orderId: number): Promise<Reservation[]> {
    return this.reservationRepository.find({ where: { order: { id: orderId } } });
  }

  async findOne(id: number): Promise<Reservation> {
    return this.reservationRepository.findOneBy({ id });
  }

  async update(id: number, updateReservationDto: UpdateReservationDto): Promise<Reservation> {
    await this.findOne(id);

    const updated = await this.reservationRepository
      .createQueryBuilder()
      .update(Reservation, updateReservationDto)
      .where('id = :id', { id })
      .returning('*')
      .execute();

    return updated.raw;
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.reservationRepository.delete({ id });
  }
}
