import { ConflictException, Injectable } from '@nestjs/common';
import { CreateSupportDto } from './dto/create-support.dto';
import { UpdateSupportDto } from './dto/update-support.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Support } from './entities/support.entity';
import { UserService } from 'src/user/user.service';

@Injectable()
export class SupportService {
  constructor(
    @InjectRepository(Support) private readonly supportReposity: Repository<Support>,
    private readonly userService: UserService,
  ) {}

  async create(userId: number, createSupportDto: CreateSupportDto) {
    const user = await this.userService.findOne(userId);
    const newSupportRecord = await this.supportReposity.manager
      .createQueryBuilder()
      .insert()
      .into(Support)
      .values({ user, ...createSupportDto })
      .returning('*')
      .execute();
    return newSupportRecord.raw;
  }

  findAll() {
    return this.supportReposity.find();
  }

  async findOne(id: number) {
    const suppertRecort = await this.supportReposity.findOneBy({ id });
    if (!suppertRecort) throw new ConflictException(`Record with id ${id} does not exist`);
    return suppertRecort;
  }

  async update(id: number, updateSupportDto: UpdateSupportDto) {
    try {
      await this.findOne(id);
    } catch (error) {
      return error;
    }

    await this.supportReposity
      .createQueryBuilder()
      .update(Support, updateSupportDto)
      .where('id = :id', { id })
      .returning('*')
      .execute();

    return `This action updates a #${id} support`;
  }

  async remove(id: number) {
    try {
      await this.findOne(id);
    } catch (error) {
      return error;
    }

    await this.supportReposity.delete({ id });
    return `This action removes a #${id} support`;
  }
}
