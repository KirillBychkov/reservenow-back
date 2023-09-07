import { ConflictException, Injectable } from '@nestjs/common';
import { CreateManagerDto } from './dto/create-manager.dto';
import { UpdateManagerDto } from './dto/update-manager.dto';
import { Manager } from './entities/manager.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserService } from 'src/user/user.service';

@Injectable()
export class ManagerService {
  constructor(
    @InjectRepository(Manager) private readonly managerRepository: Repository<Manager>,
    private readonly userService: UserService,
  ) {}

  async create(createManagerDto: CreateManagerDto): Promise<Manager> {
    const { userId, ...createManager } = createManagerDto;

    const user = await this.userService.findOne(userId);

    const newManager = await this.managerRepository
      .createQueryBuilder()
      .insert()
      .into(Manager)
      .values({ user, ...createManager })
      .returning('*')
      .execute();

    return newManager.raw;
  }

  findAll(): Promise<Manager[]> {
    return this.managerRepository.find();
  }

  async findOne(id: number): Promise<Manager> {
    const manager = await this.managerRepository.findOneBy({ id });
    if (!manager) throw new ConflictException(`Manager with id ${id} does not exist`);

    return manager;
  }

  async update(id: number, updateManagerDto: UpdateManagerDto) {
    try {
      await this.findOne(id);
    } catch (error) {
      return error;
    }

    const updated = await this.managerRepository
      .createQueryBuilder()
      .update(Manager, updateManagerDto)
      .where('id = :id', { id })
      .returning('*')
      .execute();

    return updated.raw;
  }

  async remove(id: number) {
    try {
      await this.findOne(id);
    } catch (error) {
      return error;
    }

    await this.managerRepository.delete({ id });
    return;
  }
}
