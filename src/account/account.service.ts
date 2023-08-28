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

  async updateAccount(account: Account) {
    const updatedAccount = await this.accountRepository
      .createQueryBuilder('account')
      .update(Account, account)
      .where('id = :id', { id: account.id })
      .returning('*')
      .execute();

    return updatedAccount.raw;
  }

  async getAccount(email: string, withPassword: boolean = false) {
    let accountQuery = this.accountRepository
      .createQueryBuilder('account')
      .where('account.email = :email', { email });

    accountQuery = withPassword
      ? accountQuery.addSelect('account.password')
      : accountQuery;

    return accountQuery.getOne();
  }
}
