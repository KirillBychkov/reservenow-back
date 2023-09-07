import { ConflictException, Injectable } from '@nestjs/common';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organization } from './entities/organization.entity';

@Injectable()
export class OrganizationService {
  constructor(
    @InjectRepository(Organization)
    private readonly organizationRepository: Repository<Organization>,
  ) {}

  async create(createOrganizationDto: CreateOrganizationDto): Promise<Organization> {
    const newOrganization = await this.organizationRepository.insert(createOrganizationDto);

    return newOrganization.raw;
  }

  findAll(): Promise<Organization[]> {
    return this.organizationRepository.find();
  }

  async findOne(id: number): Promise<Organization> {
    const organizationRecord = await this.organizationRepository.findOneBy({ id });
    if (!organizationRecord)
      throw new ConflictException(`Organization with id ${id} does not exist`);
    return organizationRecord;
  }

  async update(id: number, updateOrganizationDto: UpdateOrganizationDto): Promise<Organization> {
    try {
      await this.findOne(id);
    } catch (error) {
      return error;
    }

    const updated = await this.organizationRepository
      .createQueryBuilder()
      .update(Organization, updateOrganizationDto)
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

    await this.organizationRepository.delete({ id });
    return;
  }
}
