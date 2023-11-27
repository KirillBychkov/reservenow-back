import { ConflictException, Injectable } from '@nestjs/common';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organization } from './entities/organization.entity';
import { StorageService } from 'src/storage/storage.service';
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

  async findAll(id?: number): Promise<Organization[]> {
    let query = this.organizationRepository
      .createQueryBuilder('organization')
      .leftJoinAndSelect('organization.user', 'user');

    if (id) {
      query = query.where('organization.user.id = :id', { id });
    }

    const result = await query.getMany();
    return result;
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

    this.organizationRepository.delete({ id });
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

  async getStatistics(id: number, start_date: string, end_date: string) {
    const organization = await this.organizationRepository
      .createQueryBuilder('organization')
      .leftJoinAndSelect('organization.rental_objects', 'rental_object')
      .leftJoinAndSelect(
        'organization.reservations',
        'reservation',
        start_date ? 'reservation.created_at BETWEEN :start_date AND :end_date' : '',
        {
          start_date: new Date(start_date),
          end_date: end_date ? new Date(end_date) : DateTime.now().toISO(),
        },
      )
      .where('organization.id = :id', { id })
      .getOne();

    let totalReservationsSum = 0;
    let totalReservationsAmount = 0;
    let totalMinutes = 0;

    for (const reservation of organization.reservations) {
      const reservationTimeEnd = DateTime.fromJSDate(reservation.reservation_time_end);
      const reservationTimeStart = DateTime.fromJSDate(reservation.reservation_time_start);

      totalMinutes += reservationTimeEnd.diff(reservationTimeStart).as('minutes');
      totalReservationsSum += reservation.price;
      totalReservationsAmount++;
    }

    return { totalReservationsSum, totalReservationsAmount, totalMinutes };
    return;
  }
}
