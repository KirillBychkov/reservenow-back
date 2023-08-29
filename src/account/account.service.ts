import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Account } from './entities/account.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AccountService {
  constructor(
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
  ) {}

  getCount() {
    return this.accountRepository.createQueryBuilder('account').getCount();
  }
  async createAccount(email: string, password: string) {
    const hashedPass = bcrypt.hashSync(password, 10);
    const newAccount = await this.accountRepository.insert({
      email,
      password: hashedPass,
    });

    return newAccount.raw;
  }

  async updateAccount(id: number, fields: any) {
    const updatedAccount = await this.accountRepository.update({ id }, fields);

    return updatedAccount.raw;
  }

  async getAccount(id: number, email: string, withPassword: boolean = false) {
    let accountQuery = this.accountRepository
      .createQueryBuilder('account')
      .where('account.email = :email OR account.id = :id', { id, email });

    accountQuery = withPassword ? accountQuery.addSelect('account.password') : accountQuery;

    return accountQuery.getOne();
  }
}
