import { ConflictException, Injectable } from '@nestjs/common';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organization } from './entities/organization.entity';
import { workingHoursValidation } from 'src/helpers/workingHoursValidation';

@Injectable()
export class OrganizationService {
  constructor(
    @InjectRepository(Organization)
    private readonly organizationRepository: Repository<Organization>,
  ) {}

  async create(userId, createOrganizationDto: CreateOrganizationDto): Promise<Organization> {
    await workingHoursValidation(createOrganizationDto);
    const newOrganization = await this.organizationRepository.save({
      user: { id: userId },
      ...createOrganizationDto,
    });

    return newOrganization;
  }

  findAll(): Promise<Organization[]> {
    const organization = this.organizationRepository
      .createQueryBuilder('organization')
      .leftJoinAndSelect('organization.user', 'user')
      .getMany();

    return organization;
  }

  async findOne(id: number): Promise<Organization> {
    const organizationRecord = await this.organizationRepository
      .createQueryBuilder('organization')
      .leftJoinAndSelect('organization.user', 'user')
      .where('organization.id = :id', { id })
      .getOne();

    if (!organizationRecord)
      throw new ConflictException(`Organization with id ${id} does not exist`);

    return organizationRecord;
  }

  async update(id: number, updateOrganizationDto: UpdateOrganizationDto): Promise<Organization> {
    await this.findOne(id);

    const updated = await this.organizationRepository
      .createQueryBuilder()
      .update(Organization, updateOrganizationDto)
      .where('id = :id', { id })
      .returning('*')
      .execute();

    return updated.raw;
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.organizationRepository.delete({ id });
  }
}
