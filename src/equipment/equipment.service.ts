import { ConflictException, Injectable } from '@nestjs/common';
import { CreateEquipmentDto } from './dto/create-equipment.dto';
import { UpdateEquipmentDto } from './dto/update-equipment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Equipment } from './entities/equipment.entity';
import { Repository } from 'typeorm';

@Injectable()
export class EquipmentService {
  constructor(
    @InjectRepository(Equipment) private readonly equipmentRepository: Repository<Equipment>,
  ) {}

  async create(createEquipmentDto: CreateEquipmentDto) {
    const { userId, ...createEquipment } = createEquipmentDto;

    const newEquipment = this.equipmentRepository.insert({
      user: { id: userId },
      ...createEquipment,
    });

    return (await newEquipment).raw;
  }

  findAll() {
    return this.equipmentRepository.find();
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

    return this.equipmentRepository.delete({ id });
  }
}
