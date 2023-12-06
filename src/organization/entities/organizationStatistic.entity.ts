import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Organization } from './organization.entity';

@Entity()
export class OrganizationStatistic {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => Organization)
  @JoinColumn()
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
  statistics_per_period: string;

  @Column('jsonb')
  top_objects: string;

  @Column('jsonb')
  top_clients: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
