import { ConflictException, Injectable } from '@nestjs/common';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organization } from './entities/organization.entity';
import { StorageService } from 'src/storage/storage.service';
import { DateTime, Interval, Duration } from 'luxon';
import { Client } from 'src/client/entities/client.entity';
import { OrganizationStatistic, Period } from './entities/organizationStatistic.entity';
import { RentalObject } from 'src/rental_object/entities/rental_object.entity';
import { total_working_hours_per_week } from 'src/helpers/rental_object_helpers';
import { TopObjectsProperties } from './entities/types/top_objects.interface';
import { StatisticsPerPeriodProperties } from './entities/types/statistics_per_period.inteface';
import GetStatisticQueryDto from './dto/get-statistics-query.dto';

@Injectable()
export class OrganizationService {
  constructor(
    @InjectRepository(OrganizationStatistic)
    private readonly organizationStatisticRepository: Repository<OrganizationStatistic>,
    @InjectRepository(Organization)
    private readonly organizationRepository: Repository<Organization>,
    @InjectRepository(Client) private readonly clientRepository: Repository<Client>,

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

  async findRentalObjects(id: number): Promise<RentalObject[]> {
    const organization = await this.organizationRepository
      .createQueryBuilder('organization')
      .leftJoinAndSelect('organization.rental_objects', 'rental_object')
      .where('organization.id = :id', { id })
      .getOne();

    if (!organization) throw new ConflictException(`Organization with id ${id} does not exist`);

    return organization.rental_objects;
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
  async deleteImage(id: number) {
    const { photo } = await this.findOne(id);

    if (photo === null) {
      throw new ConflictException('Photo does not exist');
    }

    await this.storageService.s3_delete(new URL(photo));

    const updated = await this.organizationRepository
      .createQueryBuilder()
      .update(Organization)
      .set({ photo: null })
      .where('id = :id', { id })
      .returning('*')
      .execute();

    return updated.raw;
  }

  async getStatistics(id: number, query: GetStatisticQueryDto): Promise<OrganizationStatistic> {
    const { time_frame } = query;
    let { start_date, end_date } = query;
    console.log(typeof time_frame);
    if (!time_frame && !(start_date && end_date)) {
      throw new ConflictException('Time frame or (start date and end date) should be specified');
    }
    const previousStats = await this.organizationStatisticRepository.findOne({
      where: { organization: { id }, period: Period[time_frame] },
    });

    if (
      DateTime.fromISO(DateTime.now().toISO())
        .diff(DateTime.fromISO(previousStats?.created_at.toISOString()))
        .as('days') < 1
    ) {
      return previousStats;
    }

    let interval: 'hours' | 'days' | 'weeks' | 'months';

    if (time_frame === 'all') {
      start_date = DateTime.now().minus({ years: 1 }).startOf('week').toISO();
      end_date = DateTime.now().endOf('week').toISO();
    } else if (time_frame === 'month') {
      start_date = DateTime.now().minus({ months: 1 }).startOf('hour').toISO();
      end_date = DateTime.now().endOf('hour').toISO();
    } else if (time_frame === 'week') {
      start_date = DateTime.now().minus({ weeks: 1 }).startOf('day').toISO();
      end_date = DateTime.now().endOf('day').toISO();
    } else if (time_frame === 'day') {
      start_date = DateTime.now().minus({ days: 1 }).startOf('hour').toISO();
      end_date = DateTime.now().endOf('hour').toISO();
    }

    const startDateLuxon = DateTime.fromISO(start_date);
    const endDateLuxon = DateTime.fromISO(end_date);

    const timeDifference = endDateLuxon.diff(startDateLuxon);

    if (timeDifference.as('months') > 1) {
      interval = 'weeks';
    } else if (timeDifference.as('weeks') > 1) {
      interval = 'days';
    } else {
      interval = 'hours';
    }

    const organizationQuery = this.organizationRepository
      .createQueryBuilder('organization')
      .leftJoinAndSelect('organization.rental_objects', 'rental_object')
      .leftJoinAndSelect(
        'rental_object.reservations',
        'reservation',
        start_date ? 'reservation.reservation_time_end BETWEEN :start_date AND :end_date' : '',
        {
          start_date: new Date(start_date),
          end_date: end_date ? new Date(end_date) : DateTime.now().toISO(),
        },
      )
      .leftJoinAndSelect('reservation.order', 'order')
      .leftJoinAndSelect('order.user', 'user')
      .where('organization.id = :id', { id })
      .getOne();

    const clientsQuery = this.clientRepository
      .createQueryBuilder('client')
      .leftJoinAndSelect('client.orders', 'order')
      .leftJoinAndSelect('order.reservations', 'reservation')
      .leftJoinAndSelect('reservation.equipment', 'equipment')
      .leftJoinAndSelect('reservation.rental_object', 'rental_object')
      .leftJoinAndSelect('reservation.trainer', 'trainer')
      .where('reservation.reservation_time_end BETWEEN :start_date AND :end_date', {
        start_date,
        end_date,
      })
      .andWhere('rental_object.organization.id = :id', { id })
      .getMany();

    const [organization, clients] = await Promise.all([organizationQuery, clientsQuery]);
    let totalRentalObjectsHours = 0;

    const daysDifference = endDateLuxon.diff(startDateLuxon, 'days');

    const timeIntervals = Interval.fromDateTimes(startDateLuxon, endDateLuxon)
      .splitBy(Duration.fromObject({ [interval]: 1 }))
      .map((interval): [Interval, any[]] => [interval, []]);

    const rental_objects = organization.rental_objects;

    const top_objects: TopObjectsProperties[] = [];

    const top_clients = clients
      .map((client) => {
        return {
          id: client.id,
          name: `${client.first_name} ${client.last_name}`,
          total_revenue: client.orders.reduce(
            (prev, curr) =>
              (prev += curr.reservations.reduce((prev, curr) => (prev += curr.price), 0)),
            0,
          ),
        };
      })
      .sort((a, b) => b.total_revenue - a.total_revenue)
      .slice(0, 4);

    rental_objects.forEach((rental_object) => {
      const reservations = rental_object.reservations;

      const notEmptyDays = new Set();

      const totalWokringHours =
        total_working_hours_per_week(rental_object) * Math.ceil(daysDifference.as('weeks'));
      let totalObjectMinutes = 0;

      totalRentalObjectsHours += totalWokringHours;

      reservations.forEach((reservation) => {
        const reservationTimeStart = DateTime.fromJSDate(reservation.reservation_time_start);
        const reservationTimeEnd = DateTime.fromJSDate(reservation.reservation_time_end);
        notEmptyDays.add(reservationTimeEnd.toISODate());
        const dateIndex = timeIntervals.findIndex((interval) =>
          interval[0].contains(reservationTimeEnd),
        );

        const rentalObjIndex = timeIntervals[dateIndex][1].findIndex(
          (rentalObj) => rentalObj.rentalObject.id === rental_object.id,
        );

        if (rentalObjIndex === -1) {
          totalObjectMinutes = reservationTimeEnd.diff(reservationTimeStart).as('minutes');
          timeIntervals[dateIndex][1].push({
            rentalObject: rental_object,
            totalObjectReservationsSum: reservation.price,
            totalObjectReservationsAmount: 1,
            totalObjectMinutes: reservationTimeEnd.diff(reservationTimeStart).as('minutes'),
          });
        } else {
          timeIntervals[dateIndex][1][rentalObjIndex].totalObjectReservationsSum +=
            reservation.price;
          timeIntervals[dateIndex][1][rentalObjIndex].totalObjectReservationsAmount++;
          timeIntervals[dateIndex][1][rentalObjIndex].totalObjectMinutes += reservationTimeEnd
            .diff(reservationTimeStart)
            .as('minutes');
        }
      });

      top_objects.push({
        id: rental_object.id,
        name: rental_object.name,
        total_reservations: rental_object.reservations.length,
        empty_days: Math.ceil(endDateLuxon.diff(startDateLuxon, 'days').days) - notEmptyDays.size,
        load: (totalObjectMinutes / 60 / totalWokringHours) * 100,
        total_revenue: rental_object.reservations.reduce((prev, curr) => (prev += curr.price), 0),
      });
    });

    const reservationPerPeriod: StatisticsPerPeriodProperties[] = timeIntervals.map((interval) => {
      return {
        period: interval[0].toISO(),
        total_revenue: interval[1].reduce(
          (prev, curr) => prev + curr.totalObjectReservationsSum,
          0,
        ),
        total_reservations: interval[1].reduce(
          (prev, curr) => prev + curr.totalObjectReservationsAmount,
          0,
        ),
        total_hours: interval[1].reduce((prev, curr) => prev + curr.totalObjectMinutes, 0) / 60,
      };
    });

    const totals = reservationPerPeriod.reduce(
      (prev, curr) => {
        return {
          total_revenue: prev.total_revenue + curr.total_revenue,
          total_reservations: prev.total_reservations + curr.total_reservations,
          total_hours: prev.total_hours + curr.total_hours,
        };
      },
      {
        total_revenue: 0,
        total_reservations: 0,
        total_hours: 0,
      },
    );

    const statsObject = {
      organization: { id },
      ...totals,
      period: time_frame ? Period[time_frame] : Period.custom,
      statistics_per_period: reservationPerPeriod,
      organization_load: (totals.total_hours / totalRentalObjectsHours) * 100,
      top_objects: top_objects,
      top_clients: top_clients,
    };

    if (previousStats) {
      const updated = await this.organizationStatisticRepository
        .createQueryBuilder()
        .update(OrganizationStatistic, statsObject)
        .where('id = :id', { id: previousStats.id })
        .returning('*')
        .execute();

      return updated.raw;
    }

    const stats = await this.organizationStatisticRepository.save(statsObject);

    return stats[0];
  }
}
