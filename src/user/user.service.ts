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

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private dataSource: DataSource,
    private accountService: AccountService,
    private tokenService: TokenService,
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

    const users = await this.userRepository
      .createQueryBuilder('user')
      .where(`user.first_name || ' ' || user.last_name ILIKE :search `, { search: `%${search}%` })
      .leftJoinAndSelect('user.account', 'account')
      .leftJoinAndSelect('account.role', 'role')
      .getMany();

    return { filters: { skip, limit, search, total: users.length }, data: users };
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

    const queryRunner = await this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const newUser = await queryRunner.manager.save(User, user);

      const accountToCreate = await this.accountService.getNewAccount(email, null, newUser);

      const account = await queryRunner.manager.save(Account, accountToCreate);
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

  async update(id: number, fieldsToUpdate: any): Promise<User> {
    await this.findOne(id);

    const updated = await this.userRepository
      .createQueryBuilder()
      .update(User, fieldsToUpdate)
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
}
