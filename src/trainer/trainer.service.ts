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
import { StorageService } from 'src/storage/storage.service';
import { MailService } from 'src/mail/mail.service';
import { DateTime } from 'luxon';

@Injectable()
export class TrainerService {
  constructor(
    @InjectRepository(Trainer) private trainerRepository: Repository<Trainer>,
    private readonly dataSource: DataSource,
    private readonly accountService: AccountService,
    private readonly roleService: RoleService,
    private readonly tokenService: TokenService,
    private readonly storageService: StorageService,
    private readonly mailService: MailService,
  ) {}

  async create(userId, createTrainerDto: CreateTrainerDto) {
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

      const account = await queryRunner.manager.save(Account, {
        email,
        role,
        trainer: newTrainer,
      });
      await queryRunner.commitTransaction();

      const verify_token = await this.tokenService.generateToken(
        { id: account.id, email: account.email },
        process.env.VERIFY_SECRET,
        60 * 60,
      );

      this.tokenService.createToken(account.id, {
        verify_token,
        expires_at: DateTime.utc().plus({ minutes: 60 }).toISO().slice(0, -1),
      });

      this.mailService.sendMail(
        email,
        'Verify your account',
        'http://127.0.0.1:5173/activate-account?verify_token=' + verify_token,
      );

      return { verify_token };
    } catch (error) {
      console.log(error);
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }

  findAll(userId: number): Promise<Trainer[]> {
    const trainers = this.trainerRepository
      .createQueryBuilder('trainer')
      .leftJoinAndSelect('trainer.user', 'user')
      .leftJoinAndSelect('trainer.account', 'account')
      .leftJoinAndSelect('account.role', 'role')
      .where('user.id = :id', { id: userId })
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

  async uploadImage(id: number, file: Express.Multer.File) {
    const { image: oldImage } = await this.findOne(id);

    if (oldImage !== null) {
      await this.storageService.s3_delete(new URL(oldImage));
    }

    const image = await this.storageService.s3_upload(
      file,
      `traineravatar/${id}/avatar.${file.originalname.split('.').pop()}`,
    );

    const updated = await this.trainerRepository
      .createQueryBuilder()
      .update(Trainer)
      .set({ image: image.location })
      .where('id = :id', { id })
      .returning('*')
      .execute();

    return updated.raw;
  }
}
