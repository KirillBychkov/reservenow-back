import { ConflictException, Injectable } from '@nestjs/common';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organization } from './entities/organization.entity';
import { StorageService } from 'src/storage/storage.service';
import { Reservation } from 'src/reservation/entities/reservation.entity';
import { DateTime } from 'luxon';

@Injectable()
export class OrganizationService {
  constructor(
    @InjectRepository(Organization)
    private readonly organizationRepository: Repository<Organization>,
    private readonly storageService: StorageService,
  ) {}

  async create(userId, createOrganizationDto: CreateOrganizationDto): Promise<Organization> {
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

  async uploadImage(id: number, file: Express.Multer.File) {
    const { photo: oldPhoto } = await this.findOne(id);

    if (oldPhoto !== null) {
      await this.storageService.s3_delete(new URL(oldPhoto));
    }

    const photo = await this.storageService.s3_upload(
      file,
      `organization/${id}/avatar.${file.originalname.split('.').pop()}`,
    );

    const updated = await this.organizationRepository
      .createQueryBuilder()
      .update(Organization)
      .set({ photo: photo.location })
      .where('id = :id', { id })
      .returning('*')
      .execute();

    return updated.raw;
  }

  async getStatistics(id: number) {
    const organization = await this.organizationRepository
      .createQueryBuilder('organization')
      .leftJoinAndSelect('organization.rental_objects', 'rental_object')
      .leftJoinAndSelect('organization.reservations', 'reservation')
      .where('organization.id = :id', { id })
      .getOne();

    let totalReservationsSum = 0;
    let totalReservationsAmount = 0;
    let totalMinutes = 0;

    organization.reservations.forEach((reservation) => {
      const reservation_time_end = DateTime.fromJSDate(reservation.reservation_time_end);
      const reservation_time_start = DateTime.fromJSDate(reservation.reservation_time_start);

      totalMinutes += reservation_time_end.diff(reservation_time_start).as('minutes');
      totalReservationsSum += reservation.price;
      totalReservationsAmount++;
    });

    console.log(organization.reservations);

    console.log({ totalReservationsSum, totalReservationsAmount, totalMinutes });

    return;
  }
}
