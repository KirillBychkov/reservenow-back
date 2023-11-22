import { ConflictException, Injectable } from '@nestjs/common';
import { CreateSupportDto } from './dto/create-support.dto';
import { UpdateSupportDto } from './dto/update-support.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Support } from './entities/support.entity';
import { UserService } from 'src/user/user.service';
import ElementsQueryDto from 'src/user/dto/query.dto';
import FindAllSupportRecordsDto from './dto/find-all-support-records.dto';
import { StorageService } from 'src/storage/storage.service';

@Injectable()
export class SupportService {
  constructor(
    @InjectRepository(Support) private readonly supportReposity: Repository<Support>,
    private readonly userService: UserService,
    private readonly storageService: StorageService,
  ) {}

  async create(user_id: number, createSupportDto: CreateSupportDto): Promise<Support> {
    const user = await this.userService.findOne(user_id);
    const newSupportRecord = await this.supportReposity.save({ user, ...createSupportDto });

    return newSupportRecord;
  }

  async findAll(query: ElementsQueryDto): Promise<FindAllSupportRecordsDto> {
    const { search, limit, sort, skip } = query;

    const sortFilters = (sort == undefined ? 'created_at:1' : sort).split(':');

    const records = await this.supportReposity
      .createQueryBuilder('support')
      .leftJoinAndSelect('support.user', 'user')
      .leftJoinAndSelect('user.account', 'account')
      .where('CAST(support.id AS VARCHAR(10)) ILIKE :search', { search: `%${search ?? ''}%` })
      .orderBy(`support.${sortFilters[0]}`, sortFilters[1] === '1' ? 'ASC' : 'DESC')
      .skip(skip ?? 0)
      .take(limit ?? 10)
      .getManyAndCount();

    return {
      filters: { skip, limit, search, total: records[1], received: records[0].length },
      data: records[0],
    };
  }

  async findOne(id: number): Promise<Support> {
    const supportRecord = await this.supportReposity
      .createQueryBuilder('support')
      .where('support.id = :id', { id })
      .leftJoinAndSelect('support.user', 'user')
      .leftJoinAndSelect('user.account', 'account')
      .getOne();

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

  async uploadImage(id: number, file: Express.Multer.File) {
    const { file: oldPhoto } = await this.findOne(id);

    if (oldPhoto !== null) {
      await this.storageService.s3_delete(new URL(oldPhoto));
    }

    const photo = await this.storageService.s3_upload(file, `support/${id}/${file.originalname}`);

    const updated = await this.supportReposity
      .createQueryBuilder()
      .update(Support)
      .set({ file: photo.location })
      .where('id = :id', { id })
      .returning('*')
      .execute();

    return updated.raw;
  }
}
