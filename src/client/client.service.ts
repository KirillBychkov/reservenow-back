import { ConflictException, Injectable } from '@nestjs/common';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from './entities/client.entity';
import { UserService } from 'src/user/user.service';

@Injectable()
export class ClientService {
  constructor(
    @InjectRepository(Client) private readonly clientRepository: Repository<Client>,
    private readonly userService: UserService,
  ) {}

  // async create(createClientDto: CreateClientDto): Promise<Client> {
  //   const {  ...client } = createClientDto;
  //   const user = await this.userService.findOne(user_id);

  //   const newClient = await this.clientRepository.insert({
  //     user,
  //     ...client,
  //     account: null,
  //   });
  //   return newClient.raw;
  // }

  findAll(): Promise<Client[]> {
    return this.clientRepository.find();
  }

  async findOne(id: number): Promise<Client> {
    const client = await this.clientRepository.findOneBy({ id });
    if (!client) throw new ConflictException(`A client with id ${id} does not exist`);
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
