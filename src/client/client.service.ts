import { ConflictException, Injectable } from '@nestjs/common';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from './entities/client.entity';
import { UserService } from 'src/user/user.service';
import ElementsQueryDto from './dto/query.dto';
import FindAllСlientsDto from './dto/find-all-clients.dto';

@Injectable()
export class ClientService {
  constructor(
    @InjectRepository(Client) private readonly clientRepository: Repository<Client>,
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

  async findAll(userId: number, query: ElementsQueryDto): Promise<FindAllСlientsDto> {
    const { search, limit, sort, skip } = query;

    const sortFilters = (sort == undefined ? 'created_at:1' : sort).split(':');

    let clientsQuery = this.clientRepository
      .createQueryBuilder('client')
      .where(`client.first_name || ' ' || client.last_name ILIKE :search `, {
        search: `%${search ?? ''}%`,
      })
      .orderBy(`client.${sortFilters[0]}`, sortFilters[1] === '1' ? 'ASC' : 'DESC')
      .skip(skip ?? 0)
      .take(limit ?? 10);

    if (userId) clientsQuery = clientsQuery.andWhere('client.user.id = :userId', { userId });

    const clients = await clientsQuery.getManyAndCount();

    return {
      filters: { skip, limit, search, total: clients[1], received: clients[0].length },
      data: clients[0],
    };
  }

  async findOne(id: number): Promise<Client> {
    const client = await this.clientRepository
      .createQueryBuilder('client')
      .leftJoinAndSelect('client.orders', 'order')
      .leftJoinAndSelect('order.reservations', 'reservation')
      .getOne();

    if (!client) throw new ConflictException(`A client with id ${id} does not exist`);
    return client;
  }

  async findOneByPhone(phone: string): Promise<Client> {
    const client = await this.clientRepository
      .createQueryBuilder('client')
      .where('client.phone = :phone', { phone })
      .getOne();

    return client;
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
