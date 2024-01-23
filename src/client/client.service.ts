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
import { ExportService } from 'src/export/export.service';

@Injectable()
export class ClientService {
  constructor(
    @InjectRepository(Client) private readonly clientRepository: Repository<Client>,
    private readonly reservationService: ReservationService,
    private readonly userService: UserService,
    private readonly exportService: ExportService,
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

    console.log(query);

    const clientsQuery = this.clientRepository
      .createQueryBuilder('client')
      .leftJoinAndSelect('client.orders', 'order')
      .leftJoinAndSelect('order.reservations', 'reservation')
      .leftJoinAndSelect('reservation.equipment', 'equipment')
      .leftJoinAndSelect('reservation.rental_object', 'rental_object')
      .leftJoinAndSelect('reservation.trainer', 'trainer')
      .where(`client.first_name || ' ' || client.last_name ILIKE :search `, {
        search: `%${search ?? ''}%`,
      });

    if (organization_id) {
      clientsQuery.andWhere('rental_object.organization.id = :organization_id', {
        organization_id,
      });
    }

    const clientsTotals = this.clientRepository
      .createQueryBuilder('client')
      .leftJoin('client.orders', 'order')
      .leftJoin('order.reservations', 'reservation')
      .groupBy('client.id')
      .select([
        'client.id',
        'SUM(reservation.price) AS total_reservation_sum',
        'COUNT(reservation.id) AS total_reservation_amount',
      ])
      .where(`client.first_name || ' ' || client.last_name ILIKE :search `, {
        search: `%${search ?? ''}%`,
      });

    if (userId) {
      clientsQuery.andWhere('client.user.id = :userId', { userId });
      clientsTotals.andWhere('client.user.id = :userId', { userId });
    }

    let orderByTotals = false;
    if (sort) {
      const sortFilters = sort.split(':');
      orderByTotals =
        sortFilters[0] === 'total_reservation_sum' || sortFilters[0] === 'total_reservation_amount';

      if (orderByTotals) {
        clientsTotals.orderBy(sortFilters[0], sortFilters[1] === '1' ? 'ASC' : 'DESC');
      } else {
        clientsQuery.orderBy(`client.${sortFilters[0]}`, sortFilters[1] === '1' ? 'ASC' : 'DESC');
      }
    }

    const fetchedTotals = await clientsTotals.getRawMany();
    const fetchedClients = await clientsQuery.getManyAndCount();

    const clientsOrder = () => {
      return fetchedClients[0].map((client) => {
        const totals = fetchedTotals.find((result) => result.client_id === client.id);
        return { ...client, ...totals };
      });
    };

    const totalsOrder = () => {
      return fetchedTotals.map((result) => {
        const client = fetchedClients[0].find((client) => client.id === result.client_id);
        return { ...client, ...result };
      });
    };

    const clients = orderByTotals ? totalsOrder() : clientsOrder();
    const slicedClients = clients.slice(Number(skip ?? 0), Number(skip ?? 0) + Number(limit ?? 10));

    return {
      filters: { skip, limit, search, total: fetchedClients[1], received: slicedClients.length },
      data: slicedClients,
    };
  }

  async export(userId: number, query?: ElementsQueryDto) {
    const clients = await this.findAll(userId, query);

    return this.exportService.exportAsExcel(clients.data, 'clients');
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
