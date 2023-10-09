import { ConflictException, Injectable } from '@nestjs/common';
import { CreateTrainerDto } from './dto/create-trainer.dto';
import { UpdateTrainerDto } from './dto/update-trainer.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Trainer } from './entities/trainer.entity';
import { AccountService } from 'src/account/account.service';
import { RoleService } from 'src/role/role.service';
import { Account } from 'src/account/entities/account.entity';
import { TokenService } from 'src/token/token.service';
import { workingHoursValidation } from 'src/helpers/workingHoursValidation';

@Injectable()
export class TrainerService {
  constructor(
    @InjectRepository(Trainer) private trainerRepository: Repository<Trainer>,
    private readonly dataSource: DataSource,
    private readonly accountService: AccountService,
    private readonly roleService: RoleService,
    private readonly tokenService: TokenService,
  ) {}

  async create(userId, createTrainerDto: CreateTrainerDto) {
    await workingHoursValidation(createTrainerDto);

    const { email, ...trainer } = createTrainerDto;
    await this.accountService.checkEmail(email);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const [newTrainer, role] = await Promise.all([
        queryRunner.manager.save(Trainer, {
          user: { id: userId },
          ...trainer,
        }),
        this.roleService.getByName('trainer'),
      ]);

      const account = await queryRunner.manager.insert(Account, {
        email,
        role,
        trainer: newTrainer,
      });
      await queryRunner.commitTransaction();

      const reset_token = await this.tokenService.generateToken(
        { id: account.raw.id, email: account.raw.email },
        process.env.RESET_SECRET,
        60 * 60,
      );
      return { reset_token };
    } catch (error) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
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
