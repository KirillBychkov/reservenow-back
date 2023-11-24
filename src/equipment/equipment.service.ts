import { ConflictException, Injectable } from '@nestjs/common';
import { CreateEquipmentDto } from './dto/create-equipment.dto';
import { UpdateEquipmentDto } from './dto/update-equipment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Equipment } from './entities/equipment.entity';
import { Repository } from 'typeorm';
import ElementsQueryDto from './dto/query.dto';
import FindAllEquipmentDto from './dto/find-all-equipment.dto';

@Injectable()
export class EquipmentService {
  constructor(
    @InjectRepository(Equipment) private readonly equipmentRepository: Repository<Equipment>,
  ) {}

  async create(userId: number, createEquipmentDto: CreateEquipmentDto) {
    const newEquipment = await this.equipmentRepository.save({
      user: { id: userId },
      ...createEquipmentDto,
    });

    return newEquipment;
  }

  async findAll(query: ElementsQueryDto, id?: number): Promise<FindAllEquipmentDto> {
    const { search, limit, sort, skip } = query;

    const sortFilters = (sort == undefined ? 'created_at:1' : sort).split(':');

    let equipmentQuery = this.equipmentRepository
      .createQueryBuilder('equipment')
      .leftJoinAndSelect('equipment.user', 'user')
      .where(`equipment.name ILIKE '%${search ?? ''}%'`)
      .where('equipment.is_deleted = false')
      .orderBy(`equipment.${sortFilters[0]}`, sortFilters[1] === '1' ? 'ASC' : 'DESC')
      .skip(skip ?? 0)
      .take(limit ?? 10);

    if (id) {
      equipmentQuery = equipmentQuery.andWhere('equipment.user.id = :id', { id });
    }

    const equipment = await equipmentQuery.getManyAndCount();
    return {
      filters: { skip, limit, search, total: equipment[1], received: equipment[0].length },
      data: equipment[0],
    };
  }

  findOne(id: number) {
    const equipment = this.equipmentRepository.findOneBy({ id });
    if (!equipment) throw new ConflictException(`Equipment with id ${id} does not exist`);

    return equipment;
  }

  async update(id: number, updateEquipmentDto: UpdateEquipmentDto) {
    await this.findOne(id);

    const updated = await this.equipmentRepository
      .createQueryBuilder()
      .update(Equipment, updateEquipmentDto)
      .where('id = :id', { id })
      .returning('*')
      .execute();

    return updated;
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.equipmentRepository.update(id, { is_deleted: true });
  }
}
