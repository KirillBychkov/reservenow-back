import { ConflictException, Injectable } from '@nestjs/common';
import { CreateRentalObjectDto } from './dto/create-rental_object.dto';
import { UpdateRentalObjectDto } from './dto/update-rental_object.dto';
import { RentalObject } from './entities/rental_object.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrganizationService } from 'src/organization/organization.service';

@Injectable()
export class RentalObjectService {
  constructor(
    @InjectRepository(RentalObject)
    private readonly rentalObjectsRepository: Repository<RentalObject>,
    private readonly organizationService: OrganizationService,
  ) {}

  async create(createRentalObjectDto: CreateRentalObjectDto): Promise<RentalObject> {
    const { organizationId, ...rentalObject } = createRentalObjectDto;
    try {
      const organization = await this.organizationService.findOne(organizationId);

      return this.rentalObjectsRepository.create({ organization, ...rentalObject });
    } catch (error) {
      return error;
    }
  }

  findAll(): Promise<RentalObject[]> {
    return this.rentalObjectsRepository.find();
  }

  async findOne(id: number): Promise<RentalObject> {
    const rentalObject = this.rentalObjectsRepository.findOneBy({ id });
    if (!rentalObject) throw new ConflictException(`Rental object with id ${id} does not exist`);
    return rentalObject;
  }

  async update(id: number, updateRentalObjectDto: UpdateRentalObjectDto): Promise<RentalObject> {
    try {
      await this.findOne(id);
    } catch (error) {
      return error;
    }

    const updated = await this.rentalObjectsRepository
      .createQueryBuilder()
      .update(RentalObject, updateRentalObjectDto)
      .where('id = :id', { id })
      .returning('*')
      .execute();

    return updated.raw;
  }

  async remove(id: number) {
    try {
      await this.findOne(id);
    } catch (error) {
      return error;
    }

    await this.rentalObjectsRepository.delete({ id });
    return;
  }
}
