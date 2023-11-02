import { ConflictException, Injectable } from '@nestjs/common';
import { CreateManagerDto } from './dto/create-manager.dto';
import { UpdateManagerDto } from './dto/update-manager.dto';
import { Manager } from './entities/manager.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { StorageService } from 'src/storage/storage.service';
import { AccountService } from 'src/account/account.service';
import { RoleService } from 'src/role/role.service';
import { TokenService } from 'src/token/token.service';
import { Account } from 'src/account/entities/account.entity';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class ManagerService {
  constructor(
    @InjectRepository(Manager) private readonly managerRepository: Repository<Manager>,
    private readonly mailService: MailService,
    private readonly dataSource: DataSource,
    private readonly accountService: AccountService,
    private readonly roleService: RoleService,
    private readonly storageService: StorageService,
    private readonly tokenService: TokenService,
  ) {}

  async create(userId: number, createManagerDto: CreateManagerDto): Promise<any> {
    const { email, ...manager } = createManagerDto;
    await this.accountService.checkEmail(email);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const [newManager, role] = await Promise.all([
        queryRunner.manager.save(Manager, {
          user: { id: userId },
          ...manager,
        }),
        this.roleService.getByName('trainer'),
      ]);

      const account = await queryRunner.manager.save(Account, {
        email,
        role,
        trainer: newManager,
      });
      await queryRunner.commitTransaction();

      const verify_token = await this.tokenService.generateToken(
        { id: account.id, email: account.email },
        process.env.VERIFY_TOKEN,
        60 * 60,
      );

      this.mailService.sendMail(
        account.email,
        'Verify your account',
        'http://127.0.0.1:5173/activate-account?verify_token=' + verify_token,
      );

      return { verify_token };
    } catch (error) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }

  findAll(): Promise<Manager[]> {
    return this.managerRepository
      .createQueryBuilder('manager')
      .leftJoinAndSelect('manager.user', 'user')
      .leftJoinAndSelect('manager.account', 'account')
      .leftJoinAndSelect('account.role', 'role')
      .getMany();
  }

  async findOne(id: number): Promise<Manager> {
    const manager = await this.managerRepository.findOneBy({ id });
    if (!manager) throw new ConflictException(`Manager with id ${id} does not exist`);

    return manager;
  }

  async update(id: number, updatedManagerDto: UpdateManagerDto) {
    await this.findOne(id);

    const updated = await this.managerRepository
      .createQueryBuilder()
      .update(Manager, updatedManagerDto)
      .where('id = :id', { id })
      .returning('*')
      .execute();

    return updated.raw;
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.managerRepository.delete({ id });
  }

  async uploadImage(id: number, file: Express.Multer.File) {
    const { image: oldImage } = await this.findOne(id);

    if (oldImage !== null) {
      await this.storageService.s3_delete(new URL(oldImage));
    }

    const image = await this.storageService.s3_upload(
      file,
      `manageravatar/${id}/avatar.${file.originalname.split('.').pop()}`,
    );

    const updated = await this.managerRepository
      .createQueryBuilder()
      .update(Manager)
      .set({ image: image.location })
      .where('id = :id', { id })
      .returning('*')
      .execute();

    return updated.raw;
  }
}
