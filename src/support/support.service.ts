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

  async create(userId: number, createSupportDto: CreateSupportDto): Promise<Support> {
    const user = await this.userService.findOne(userId);
    const newSupportRecord = await this.supportReposity
      .createQueryBuilder()
      .insert()
      .into(Support)
      .values({ user, ...createSupportDto })
      .returning('*')
      .execute();
    return newSupportRecord.raw;
  }

  findAll(): Promise<Support[]> {
    return this.supportReposity.find();
  }

  async findOne(id: number): Promise<Support> {
    const supportRecord = await this.supportReposity.findOneBy({ id });
    if (!supportRecord) throw new ConflictException(`Support record with id ${id} does not exist`);
    return supportRecord;
  }

  async update(id: number, updateSupportDto: UpdateSupportDto): Promise<Support> {
    await this.findOne(id);

    const updated = await this.supportReposity
      .createQueryBuilder()
      .update(Support, updateSupportDto)
      .where('id = :id', { id })
      .returning('*')
      .execute();

    return updated.raw;
  }

  async remove(id: number) {
    await this.findOne(id);

    await this.supportReposity.delete({ id });
    return;
  }
}
