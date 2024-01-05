import { ConflictException, Injectable } from '@nestjs/common';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from './entities/client.entity';
import { UserService } from 'src/user/user.service';
import ElementsQueryDto from './dto/query.dto';
import FindAllСlientsDto from './dto/find-all-clients.dto';
import { ReservationService } from 'src/reservation/reservation.service';
import ReservationQueryDto from './dto/reservations-query.dto';
import FindAllReservationsByClientDto from 'src/reservation/dto/find-reservations-by-client.dto';
import { FindByPhoneQueryDto } from './dto/find-by-phone-query.dto';

@Injectable()
export class ClientService {
  constructor(
    @InjectRepository(Client) private readonly clientRepository: Repository<Client>,
    private readonly reservationService: ReservationService,
    private readonly userService: UserService,
  ) {}

  async create(userId, createClientDto: CreateClientDto): Promise<Client> {
    try {
      const newClient = await this.clientRepository.save({
        user: { id: userId },
        ...createClientDto,
        account: null,
      });
      return newClient;
    } catch (error) {
      if (error.code === '23505')
        throw new ConflictException(
          `Client with phone number '${createClientDto.phone}' already exists`,
        );
    }
  }

  async findAll(userId: number, query?: ElementsQueryDto): Promise<FindAllСlientsDto> {
    const { organization_id, search, limit, sort, skip } = query;

    const sortFilters = (sort == undefined ? 'created_at:1' : sort).split(':');

    const clientsQuery = this.clientRepository
      .createQueryBuilder('client')
      .leftJoinAndSelect('client.orders', 'order')
      .leftJoinAndSelect('order.reservations', 'reservation')
      .leftJoinAndSelect('reservation.equipment', 'equipment')
      .leftJoinAndSelect('reservation.rental_object', 'rental_object')
      .leftJoinAndSelect('reservation.trainer', 'trainer')
      .andWhere(`client.first_name || ' ' || client.last_name ILIKE :search `, {
        search: `%${search ?? ''}%`,
      })
      .skip(skip ?? 0)
      .take(limit ?? 10);

    if (
      sortFilters[0] !== 'total_reservation_sum' &&
      sortFilters[0] !== 'total_reservation_amount'
    ) {
      clientsQuery.orderBy(`client.${sortFilters[0]}`, sortFilters[1] === '1' ? 'ASC' : 'DESC');
    }
    if (userId) clientsQuery.andWhere('client.user.id = :userId', { userId });
    if (organization_id) {
      clientsQuery.andWhere('rental_object.organization.id = :organization_id', {
        organization_id,
      });
    }

    const fetchedClients = await clientsQuery.getManyAndCount();
    const clients = fetchedClients[0].map((client) => {
      const totals = client.orders.reduce(
        (prev, curr) => {
          return {
            total_reservation_sum:
              prev.total_reservation_sum +
              curr.reservations.reduce((prev, curr) => (prev += curr.price), 0),
            total_reservation_amount: prev.total_reservation_amount + curr.reservations.length,
          };
        },
        { total_reservation_sum: 0, total_reservation_amount: 0 },
      );
      return { ...client, ...totals };
    });

    // Check if sorting by total_reservation_sum is required
    if (
      sortFilters[0] === 'total_reservation_sum' ||
      sortFilters[0] === 'total_reservation_amount'
    ) {
      clients.sort((a, b) => {
        if (sortFilters[1] === '1') {
          return a[sortFilters[0]] - b[sortFilters[0]];
        } else {
          return b[sortFilters[0]] - a[sortFilters[0]];
        }
      });
    }

    return {
      filters: { skip, limit, search, total: fetchedClients[1], received: clients.length },
      data: clients,
    };
  }

  async findOne(id: number): Promise<Client> {
    const client = await this.clientRepository
      .createQueryBuilder('client')
      .leftJoinAndSelect('client.orders', 'order')
      .leftJoinAndSelect('order.reservations', 'reservation')
      .select('client.*')
      .addSelect('SUM(reservation.price)', 'total_reservation_sum')
      .addSelect('COUNT(reservation.id)', 'total_reservation_amount')
      .groupBy('client.id')
      .where('client.id = :id', { id })
      .getRawOne();

    if (!client) throw new ConflictException(`A client with id ${id} does not exist`);
    return client;
  }

  async findOneByPhone(phoneQuery: FindByPhoneQueryDto): Promise<Client> {
    let { phone } = phoneQuery;

    // Trim whitespaces
    phone = phone.trim();

    // Remove '+' from start if it exists
    if (phone.startsWith('+')) {
      phone = phone.substring(1);
    }

    const client = await this.clientRepository
      .createQueryBuilder('client')
      .leftJoinAndSelect('client.orders', 'order')
      .leftJoinAndSelect('order.reservations', 'reservation')
      .select('client.*')
      .addSelect('SUM(reservation.price)', 'total_reservation_sum')
      .addSelect('COUNT(reservation.id)', 'total_reservation_amount')
      .groupBy('client.id')
      // Use LIKE operator for partial match
      .where('client.phone LIKE :phone', { phone: '%' + phone + '%' })
      .getRawOne();

    return client;
  }

  async getReservations(
    clientId: number,
    query: ReservationQueryDto,
  ): Promise<FindAllReservationsByClientDto> {
    const reservations = await this.reservationService.getReservationsByClientIdOrRentObjId(
      query,
      clientId,
    );
    return reservations;
  }

  async update(id: number, updateClientDto: UpdateClientDto): Promise<Client> {
    await this.findOne(id);

    const updated = await this.clientRepository
      .createQueryBuilder()
      .update(Client, updateClientDto)
      .where('id = :id', { id })
      .returning('*')
      .execute();
    return updated.raw;
  }

  remove(id: number) {
    return this.clientRepository.delete({ id });
  }
}
