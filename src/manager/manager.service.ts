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
    const { user_id, ...createManager } = createManagerDto;

    await this.userService.findOne(user_id);
    if (!(await this.managerRepository.findOne({ where: { user: { id: user_id } } })))
      throw new ConflictException('Manager for the user already exists');

    const newManager = await this.managerRepository.insert({
      user: { id: user_id },
      ...createManager,
    });

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
    await this.findOne(id);

    const updated = await this.managerRepository
      .createQueryBuilder()
      .update(Manager, updateManagerDto)
      .where('id = :id', { id })
      .returning('*')
      .execute();

    return updated.raw;
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.managerRepository.delete({ id });
  }
}
