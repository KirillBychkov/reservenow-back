import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Account } from './entities/account.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { RoleService } from 'src/role/role.service';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class AccountService {
  constructor(
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
    private readonly roleService: RoleService,
  ) {}

  getCount() {
    return this.accountRepository.createQueryBuilder('account').getCount();
  }

  async getNewAccount(
    email: string,
    password: string,
    user: User,
    roleName: string = 'user_viewer',
  ) {
    if (await this.accountRepository.findOneBy({ email }))
      throw new ConflictException('An account with the given email already exists');

    const hashedPass = password ? await bcrypt.hash(password, 10) : null;
    const role = await this.roleService.getByName(roleName);
    if (role === null) throw new NotFoundException('Role not found');
    const newAccount = new Account();
    newAccount.email = email;
    newAccount.password = hashedPass;
    newAccount.user = user;
    newAccount.role = role;

    return newAccount;
  }

  async createSuperUserAccount(email: string, password: string) {
    const newAccount = await this.getNewAccount(email, password, null, 'superuser');

    this.accountRepository.insert(newAccount);

    return newAccount;
  }

  async updateAccount(id: number, fields: any) {
    try {
      await this.getAccount(id, null);
    } catch (error) {
      return error;
    }
    const updatedAccount = await this.accountRepository.update({ id }, fields);

    return updatedAccount.raw;
  }

  async getAccount(id: number, email: string, withPassword: boolean = false) {
    let accountQuery = this.accountRepository
      .createQueryBuilder('account')
      .leftJoinAndSelect('account.role', 'role')
      .where('account.email = :email OR account.id = :id', { id, email });

    accountQuery = withPassword ? accountQuery.addSelect('account.password') : accountQuery;

    const account = accountQuery.getOne();

    if (!account)
      throw new ConflictException('An account with the given properties does not exist');

    return account;
  }
}
