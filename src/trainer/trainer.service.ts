import { ConflictException, Injectable } from '@nestjs/common';
import { CreateTrainerDto } from './dto/create-trainer.dto';
import { UpdateTrainerDto } from './dto/update-trainer.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Trainer } from './entities/trainer.entity';
import { UserService } from 'src/user/user.service';
import { AccountService } from 'src/account/account.service';

@Injectable()
export class TrainerService {
  constructor(
    @InjectRepository(Trainer) private trainerRepository: Repository<Trainer>,
    private readonly userService: UserService,
    private readonly accountService: AccountService,
  ) {}

  async create(createTrainerDto: CreateTrainerDto): Promise<Trainer> {
    const { user_id, ...trainer } = createTrainerDto;

    const user = await this.userService.findOne(user_id);
    if (!(await this.trainerRepository.findOne({ where: { user: { id: user_id } } })))
      throw new ConflictException('Trainer for the user already exists');

    const newTrainer = await this.trainerRepository.insert({ user, ...trainer });

    await this.accountService.update(user.account.id, {
      user: null,
      trainer: newTrainer.raw,
    });

    return newTrainer.raw;
  }

  findAll(): Promise<Trainer[]> {
    const trainers = this.trainerRepository
      .createQueryBuilder('trainer')
      .leftJoinAndSelect('trainer.user', 'user')
      .leftJoinAndSelect('trainer.account', 'account')
      .leftJoinAndSelect('account.role', 'role')
      .getMany();

    return trainers;
  }

  async findOne(id: number): Promise<Trainer> {
    const trainer = await this.trainerRepository.findOneBy({ id });
    if (!trainer) throw new ConflictException(`A trainer with id ${id} does not exist`);
    return trainer;
  }

  async update(id: number, updateTrainerDto: UpdateTrainerDto): Promise<Trainer> {
    await this.findOne(id);

    const updated = await this.trainerRepository
      .createQueryBuilder()
      .update(Trainer, updateTrainerDto)
      .where('id = :id', { id })
      .returning('*')
      .execute();

    return updated.raw;
  }

  remove(id: number) {
    return this.trainerRepository.delete({ id });
  }
}
