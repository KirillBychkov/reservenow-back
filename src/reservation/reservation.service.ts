import { Injectable } from '@nestjs/common';
// import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Reservation } from './entities/reservation.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ReservationService {
  constructor(
    @InjectRepository(Reservation) private readonly reservationRepository: Repository<Reservation>,
  ) {}

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
