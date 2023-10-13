import * as xlsx from 'xlsx';
import * as tmp from 'tmp';
import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { DataSource, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { AccountService } from 'src/account/account.service';
import { TokenService } from 'src/token/token.service';
import { Account, AccountStatus } from 'src/account/entities/account.entity';
import ElementsQueryDto from './dto/query.dto';
import FindAllUsersDto from './dto/find-all-users.dto';
import CreateUserDto from './dto/create-user.dto';
import { RoleService } from 'src/role/role.service';
import UpdateUserDto from './dto/update-user.dto';
import { StorageService } from 'src/storage/storage.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private dataSource: DataSource,
    private accountService: AccountService,
    private tokenService: TokenService,
    private roleService: RoleService,
    private storageService: StorageService,
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
    const { search, limit, skip } = query;
    console.log(limit, skip);

    const users = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.account', 'account')
      .leftJoinAndSelect('account.role', 'role')
      .where(`user.first_name || ' ' || user.last_name ILIKE :search `, {
        search: `%${search ?? ''}%`,
      })
      .orderBy('user.created_at', 'ASC')
      .skip(skip ?? 0)
      .limit(limit ?? 10)
      .getManyAndCount();

    console.log(users);

    return {
      filters: { skip, limit, search, total: users[1], received: users.length },
      data: users[0],
    };
  }

  async export(query: ElementsQueryDto): Promise<string> {
    const users = await this.findAll(query);
    const ws = xlsx.utils.json_to_sheet(users.data);

    const workBook = xlsx.utils.book_new();

    xlsx.utils.book_append_sheet(workBook, ws, 'Users');

    return new Promise((resolve, reject) => {
      tmp.file(
        { discardDescriptor: true, mode: 0o644, prefix: 'users', postfix: '.xlsx' },
        (err, file) => {
          if (err) reject(err);

          xlsx.writeFile(workBook, file);

          resolve(file);
        },
      );
    });
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

      const reset_token = await this.tokenService.generateToken(
        { id: account.id, email: account.email },
        process.env.RESET_SECRET,
        60 * 60,
      );

      return { reset_token };
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

    return updated.raw;
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
