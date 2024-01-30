import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { AccountService } from 'src/account/account.service';
import { TokenService } from 'src/token/token.service';
import { Account, AccountStatus } from 'src/account/entities/account.entity';
import FindAllUsersDto from './dto/find-all-users.dto';
import CreateUserDto from './dto/create-user.dto';
import { RoleService } from 'src/role/role.service';
import UpdateUserDto from './dto/update-user.dto';
import { StorageService } from 'src/storage/storage.service';
import ElementsQueryDto from './dto/query.dto';
import { DateTime } from 'luxon';
import { MailService } from 'src/mail/mail.service';
import { ExportService } from 'src/export/export.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly dataSource: DataSource,
    private readonly accountService: AccountService,
    private readonly tokenService: TokenService,
    private readonly roleService: RoleService,
    private readonly storageService: StorageService,
    private readonly mailService: MailService,
    private readonly exportService: ExportService,
  ) {}

  async findOne(id: number): Promise<User> {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.account', 'account')
      .leftJoinAndSelect('account.role', 'role')
      .where('user.id = :id', { id })
      .getOne();
    if (!user) throw new ConflictException(`A user with id ${id} does not exist`);
    return user;
  }

  async findAll(query: ElementsQueryDto): Promise<FindAllUsersDto> {
    const { search, limit, sort, skip } = query;

    const sortFilters = (sort == undefined ? 'created_at:1' : sort).split(':');

    const users = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.account', 'account')
      .leftJoinAndSelect('account.role', 'role')
      .where(`user.first_name || ' ' || user.last_name ILIKE :search `, {
        search: `%${search ?? ''}%`,
      })
      .andWhere('account.status != :status', { status: AccountStatus.DELETED })
      .orderBy(`user.${sortFilters[0]}`, sortFilters[1] === '1' ? 'ASC' : 'DESC')
      .skip(skip ?? 0)
      .take(limit ?? 10)
      .getManyAndCount();

    console.log(users);

    return {
      filters: { skip, limit, search, total: users[1], received: users[0].length },
      data: users[0],
    };
  }

  async export(query: ElementsQueryDto): Promise<string> {
    const users = await this.findAll(query);

    return this.exportService.exportAsExcel(users.data, 'users');
  }

  async create(createUserDTO: CreateUserDto) {
    const { email, user } = createUserDTO;
    await this.accountService.checkEmail(email);

    const queryRunner = await this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const [newUser, role] = await Promise.all([
        queryRunner.manager.save(User, user),
        this.roleService.getByName('user_full'),
      ]);

      const account = await queryRunner.manager.save(Account, { email, role, user: newUser });
      await queryRunner.commitTransaction();

      const verify_token = await this.tokenService.generateToken(
        {
          id: account.id,
          email: account.email,
          user_id: account.user.id,
          role_id: account.role.id,
        },
        process.env.VERIFY_SECRET,
        60 * 60,
      );

      this.tokenService.createToken(account.id, {
        verify_token,
        expires_at: DateTime.utc().plus({ minutes: 60 }).toISO().slice(0, -1),
      });

      this.mailService.sendMail(
        account.email,
        'Verify your account',
        'http://127.0.0.1:5173/activate-account?verify_token=' + verify_token,
      );
      return { verify_token };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      return error;
    } finally {
      await queryRunner.release();
    }
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const { image: oldImage } = await this.findOne(id);
    const { image: newImage } = updateUserDto;

    if (newImage !== undefined) {
      await this.storageService.s3_delete(new URL(oldImage));
    }

    const updated = await this.userRepository
      .createQueryBuilder()
      .update(User, updateUserDto)
      .where('id = :id', { id })
      .returning('*')
      .execute();

    return updated.raw[0];
  }

  async remove(id: number) {
    const user = await this.findOne(id);

    await this.accountService.update(user.account.id, { status: AccountStatus.DELETED });
    return;
  }

  async uploadImage(id: number, file: Express.Multer.File) {
    const { image: oldImage } = await this.findOne(id);

    if (oldImage !== null) {
      await this.storageService.s3_delete(new URL(oldImage));
    }

    const image = await this.storageService.s3_upload(
      file,
      `useravatar/${id}/avatar.${file.originalname.split('.').pop()}`,
    );

    await this.userRepository
      .createQueryBuilder()
      .update(User)
      .set({ image: image.location })
      .where('id = :id', { id })
      .execute();

    return { location: image.location };
  }
}
