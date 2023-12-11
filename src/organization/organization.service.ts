import { ConflictException, Injectable } from '@nestjs/common';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organization } from './entities/organization.entity';
import { StorageService } from 'src/storage/storage.service';
import { DateTime, Interval, Duration } from 'luxon';
import { Client } from 'src/client/entities/client.entity';
import { OrganizationStatistic } from './entities/organizationStatistic.entity';

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

  async getStatistics(
    id: number,
    start_date: string,
    end_date: string,
  ): Promise<OrganizationStatistic> {
    const previousStats = await this.organizationStatisticRepository.findOne({
      where: { organization: { id } },
    });

    if (
      DateTime.fromISO(DateTime.now().toISO())
        .diff(DateTime.fromISO(previousStats?.created_at.toISOString()))
        .as('days') < 1
    ) {
      return previousStats;
    }

    const organizationQuery = this.organizationRepository
      .createQueryBuilder('organization')
      .leftJoinAndSelect('organization.rental_objects', 'rental_object')
      .leftJoinAndSelect(
        'rental_object.reservations',
        'reservation',
        start_date ? 'reservation.created_at BETWEEN :start_date AND :end_date' : '',
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
      .where('rental_object.organization.id = :id', { id })
      .getMany();

    const [organization, clients] = await Promise.all([organizationQuery, clientsQuery]);
    let totalRentalObjectsHours = 0;

    const start_date_iso = DateTime.fromISO(start_date ?? organization.created_at.toISOString());
    const end_date_iso = DateTime.fromISO(end_date ?? DateTime.local().toUTC().toISO());
    const daysDifference = end_date_iso.diff(start_date_iso, 'days');

    const timeIntervals = Interval.fromDateTimes(
      end_date_iso.minus({ months: 11 }).startOf('month'),
      end_date_iso.endOf('month'),
    )
      .splitBy(Duration.fromObject({ weeks: 1 }))
      .map((interval): [Interval, any[]] => [interval, []]);

    const rental_objects = organization.rental_objects;

    const top_objects = [];

    const top_clients = clients
      .map((client) => {
        return {
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
      const notEmptyDays = new Set();
      const totalWokringHours =
        rental_object.total_working_hours_per_week * Math.ceil(daysDifference.as('weeks'));
      let totalObjectMinutes = 0;
      totalRentalObjectsHours += totalWokringHours;

      rental_object.reservations.forEach((reservation) => {
        const reservationTimeStart = DateTime.fromJSDate(reservation.reservation_time_start);
        const reservationTimeEnd = DateTime.fromJSDate(reservation.reservation_time_end);
        notEmptyDays.add(reservationTimeStart.toISODate());
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
        empty_days: Math.ceil(start_date_iso.diff(end_date_iso, 'days').days) - notEmptyDays.size,
        load: (totalObjectMinutes / 60 / totalWokringHours) * 100,
        total_revenue: rental_object.reservations.reduce((prev, curr) => (prev += curr.price), 0),
      });
    });

    const reservationPerWeek = timeIntervals.map((interval) => {
      return {
        week: interval[0].toISODate(),
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

    const totals = reservationPerWeek.reduce(
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
      statistics_per_period: JSON.stringify(reservationPerWeek),
      ...totals,
      organization_load: (totals.total_hours / totalRentalObjectsHours) * 100,
      top_objects: JSON.stringify(top_objects, null, 2),
      top_clients: JSON.stringify(top_clients, null, 2),
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

    return stats;
  }
}
