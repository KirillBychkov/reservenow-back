import * as xlsx from 'xlsx';
import * as tmp from 'tmp';
import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import UserDTO from './dto/update-user.dto';
import { DataSource, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { AccountService } from 'src/account/account.service';
import { TokenService } from 'src/token/token.service';
import { Account } from 'src/account/entities/account.entity';
import ElementsQueryDto from './dto/query.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private dataSource: DataSource,
    private accountService: AccountService,
    private tokenService: TokenService,
  ) {}

  async findOne(id: number) {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) throw new ConflictException(`A user with id ${id} does not exist`);
    return user;
  }

  async findAll(query: ElementsQueryDto) {
    const { search, limit, skip } = query;

    const users = await this.userRepository
      .createQueryBuilder('user')
      .limit(limit ?? 10)
      .skip(skip ?? 0)
      .getMany();

    return { filters: { skip, limit, search }, data: users };
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

  async create(email: string, userDTO: UserDTO) {
    const queryRunner = await this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = await queryRunner.manager
        .createQueryBuilder()
        .insert()
        .into(User)
        .values(userDTO)
        .returning('*')
        .execute();

      const accountToCreate = await this.accountService.getNewAccount(email, null, user.raw[0]);
      await queryRunner.commitTransaction();

      const account = (
        await queryRunner.manager
          .createQueryBuilder()
          .insert()
          .into(Account)
          .values(accountToCreate)
          .returning('*')
          .execute()
      ).raw[0];

      const reset_token = await this.tokenService.generateToken(
        { id: account.id, email: account.email },
        process.env.RESET_SECRET,
        60 * 10,
      );

      await this.tokenService.createOrUpdateToken(account, {
        reset_token: reset_token,
      });

      return { reset_token };
    } catch (error) {
      console.log(error);
      await queryRunner.rollbackTransaction();
      return error;
    } finally {
      await queryRunner.release();
    }
  }

  async partiallyUpdateUser(id: number, fieldsToUpdate: any) {
    try {
      await this.findOne(id);
    } catch (error) {
      return error;
    }

    const updated = await this.userRepository
      .createQueryBuilder()
      .update(User, fieldsToUpdate)
      .where('id = :id', { id })
      .returning('*')
      .execute();

    return updated.raw;
  }

  async fullyUpdateUser(id: number, updateUserDto: UserDTO) {
    try {
      await this.findOne(id);
    } catch (error) {
      return error;
    }

    const updated = await this.userRepository
      .createQueryBuilder()
      .update(User, updateUserDto)
      .where('id = :id', { id })
      .returning('*')
      .execute();

    return updated.raw;
  }

  async delete(id: number) {
    try {
      await this.findOne(id);
    } catch (error) {
      return error;
    }

    await this.userRepository.delete({ id });
    return;
  }
}
