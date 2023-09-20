import { Injectable } from '@nestjs/common';
import { CreateTrainerDto } from './dto/create-trainer.dto';
import { UpdateTrainerDto } from './dto/update-trainer.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Trainer } from './entities/trainer.entity';
import { UserService } from 'src/user/user.service';

@Injectable()
export class TrainerService {
  constructor(
    @InjectRepository(Trainer) private trainerRepository: Repository<Trainer>,
    private readonly userService: UserService,
  ) {}

  async create(createTrainerDto: CreateTrainerDto) {
    const { user_id, ...trainer } = createTrainerDto;
    const user = await this.userService.findOne(user_id);
    return this.trainerRepository.insert({ user, ...trainer });
  }

  findAll() {
    return this.trainerRepository.find();
  }

  findOne(id: number) {
    return this.trainerRepository.findOneBy({ id });
  }

  async update(id: number, updateTrainerDto: UpdateTrainerDto) {
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
