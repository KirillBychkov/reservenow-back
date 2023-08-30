import * as xlsx from 'xlsx';
import * as tmp from 'tmp';
import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import UserDTO from './dto/user.dto';
import { DataSource, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { AccountService } from 'src/account/account.service';
import { TokenService } from 'src/token/token.service';
import { Account } from 'src/account/entities/account.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private dataSource: DataSource,
    private accountService: AccountService,
    private tokenService: TokenService,
  ) {}

  async getById(id: number) {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) throw new ConflictException('An account with the given id does not exist');
    return user;
  }

  async get(search: string, limit: number, skip: number) {
    const users = await this.userRepository
      .createQueryBuilder('user')
      .limit(limit ?? 10)
      .skip(skip ?? 0)
      .getMany();

    return { filters: { skip, limit, search }, data: users };
  }

  async export(search: string, limit: number, skip: number): Promise<string> {
    const users = await this.get(search, limit, skip);
    const ws = xlsx.utils.json_to_sheet(users.data);

    const workBook = xlsx.utils.book_new();

    xlsx.utils.book_append_sheet(workBook, ws, 'Users');

    return new Promise((resolve, reject) => {
      tmp.file({ discardDescriptor: true, mode: 0o644, prefix: 'users', postfix: '.xlsx' }, (err, file) => {
        if (err) reject(err);

        xlsx.writeFile(workBook, file);

        resolve(file);
      });
    });
  }

  async insertUser(email: string, userDTO: UserDTO) {
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
      await queryRunner.rollbackTransaction();
      return error;
    } finally {
      await queryRunner.release();
    }
  }

  async partiallyUpdateUser(id: number, fieldsToUpdate: any) {
    try {
      await this.getById(id);
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

  async fullyUpdateUser(id: number, userDTO: UserDTO) {
    try {
      await this.getById(id);
    } catch (error) {
      return error;
    }

    const updated = await this.userRepository
      .createQueryBuilder()
      .update(User, userDTO)
      .where('id = :id', { id })
      .returning('*')
      .execute();

    return updated.raw;
  }

  async deleteUserById(id: number) {
    try {
      await this.getById(id);
    } catch (error) {
      return error;
    }

    await this.userRepository.delete({ id });
    return;
  }
}
