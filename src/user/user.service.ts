import * as xlsx from 'xlsx';
import * as tmp from 'tmp';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import UserDTO from './dto/user.dto';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(@InjectRepository(User) private readonly userRepository: Repository<User>) {}

  async get(search: string, limit: number, skip: number) {
    const users = await this.userRepository
      .createQueryBuilder('user')
      .limit(limit ?? 10)
      .skip(skip ?? 0)
      .getMany();

    return { filters: { skip, limit, search }, data: users };
  }

  async getById(id: number) {
    return this.userRepository.findOneBy({ id });
  }

  async export(search: string, limit: number, skip: number): Promise<string> {
    const users = await this.get(search, limit, skip);
    const ws = xlsx.utils.json_to_sheet(users.data);

    const workBook = xlsx.utils.book_new();

    xlsx.utils.book_append_sheet(workBook, ws, 'Users');

    return new Promise((resolve, reject) => {
      tmp.file(
        {
          discardDescriptor: true,
          mode: 0o644,
          prefix: 'users',
          postfix: '.xlsx',
        },
        (err, file) => {
          if (err) reject(err);

          xlsx.writeFile(workBook, file);

          resolve(file);
        },
      );
    });
  }

  async insertUser(userDTO: UserDTO) {
    const user = await this.userRepository.save(userDTO);
    return { user };
  }

  async partiallyUpdateUser(id: number, fieldsToUpdate: any) {
    const updated = await this.userRepository
      .createQueryBuilder('user')
      .update(User, fieldsToUpdate)
      .where('id = :id', { id })
      .returning('*')
      .execute();

    return updated.raw;
  }

  async fullyUpdateUser(id: number, userDTO: UserDTO) {
    const updated = await this.userRepository
      .createQueryBuilder('user')
      .update(User, userDTO)
      .where('id = :id', { id })
      .returning('*')
      .execute();

    return updated.raw;
  }

  async deleteUserById(id: number) {
    const result = await this.userRepository.delete({ id });
    if (result.affected === 0) throw new NotFoundException();
    return;
  }
}
