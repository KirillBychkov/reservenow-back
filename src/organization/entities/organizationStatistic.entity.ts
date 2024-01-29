import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Organization } from './organization.entity';
import { TopObjectsProperties } from './types/top_objects.interface';
import { TopClientsProperties } from './types/top_clients.interface';
import { StatisticsPerPeriodProperties } from './types/statistics_per_period.inteface';

// export enum Period {
//   all = 'all',
//   day = 'day',
//   week = 'week',
//   month = 'month',
//   custom = 'custom',
// }

@Entity()
export class OrganizationStatistic {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Organization, (organization) => organization.statistics, { onDelete: 'CASCADE' })
  organization: Organization;

  @Column()
  total_revenue: number;

  @Column()
  total_reservations: number;

  @Column()
  total_hours: number;

  @Column('float')
  organization_load: number;

  @Column('jsonb')
  statistics_per_period: StatisticsPerPeriodProperties[];

  // @Column({ type: 'enum', enum: Period })
  // period: Period;

  @Column('jsonb')
  top_objects: TopObjectsProperties[];

  @Column('jsonb')
  top_clients: TopClientsProperties[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
