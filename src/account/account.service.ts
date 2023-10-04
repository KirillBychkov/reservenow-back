import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Account, AccountStatus } from './entities/account.entity';
import { Repository } from 'typeorm';
import { RoleService } from 'src/role/role.service';
import { UpdateAccountDto } from './dto/update.account.dto';

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

  findOne(id: number): Promise<Account> {
    return this.accountRepository.findOneBy({ id });
  }

  async checkEmail(email: string) {
    if (await this.accountRepository.findOneBy({ email }))
      throw new ConflictException('An account with the given email already exists');
  }

  async createSuperUserAccount(email: string, password: string) {
    await this.checkEmail(email);

    const role = await this.roleService.getByName('superuser');

    const newAccount = this.accountRepository.insert({
      email,
      password,
      status: AccountStatus.ACTIVE,
      role,
    });

    return newAccount;
  }

  async getAccount(id: number, email: string, withPassword: boolean = false) {
    const account = await this.accountRepository
      .createQueryBuilder('account')
      .leftJoinAndSelect('account.user', 'user')
      .leftJoinAndSelect('account.role', 'role')
      .where('account.email = :email OR account.id = :id', { id, email })
      .addSelect(withPassword ? 'account.password' : '')
      .getOne();

    if (!account)
      throw new ConflictException('An account with the given properties does not exist');

    return account;
  }

  async update(id: number, updateAccountDto: UpdateAccountDto) {
    await this.findOne(id);

    const updatedAccount = await this.accountRepository
      .createQueryBuilder()
      .update(Account, updateAccountDto)
      .where('id = :id', { id })
      .returning('*')
      .execute();

    return updatedAccount.raw;
  }
}
