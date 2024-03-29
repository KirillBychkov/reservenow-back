import { RentalObject } from 'src/rental_object/entities/rental_object.entity';
import { User } from 'src/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { OrganizationStatistic } from './organizationStatistic.entity';

@Entity()
export class Organization {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToOne(() => User, (user) => user.id, { onDelete: 'CASCADE' })
  user: User;

  @OneToMany(() => RentalObject, (rentalObject) => rentalObject.organization)
  rental_objects: RentalObject[];

  // @OneToMany(() => Reservation, (reservation) => reservation.organization)
  // reservations: Reservation[];

  @OneToMany(() => OrganizationStatistic, (statistic) => statistic.organization)
  statistics: OrganizationStatistic[];

  @Column({ nullable: true })
  description?: string;

  @Column({ nullable: true })
  photo?: string;

  @Column()
  phone: string;

  @Column()
  address: string;

  @Column({ default: false })
  is_deleted: boolean;

  @Column('int', { nullable: true })
  monday_start_hours?: number;

  @Column('int', { nullable: true })
  monday_end_hours?: number;

  @Column('int', { nullable: true })
  tuesday_start_hours?: number;

  @Column('int', { nullable: true })
  tuesday_end_hours?: number;

  @Column('int', { nullable: true })
  wednesday_start_hours?: number;

  @Column('int', { nullable: true })
  wednesday_end_hours?: number;

  @Column('int', { nullable: true })
  thursday_start_hours?: number;

  @Column('int', { nullable: true })
  thursday_end_hours?: number;

  @Column('int', { nullable: true })
  friday_start_hours?: number;

  @Column('int', { nullable: true })
  friday_end_hours?: number;

  @Column('int', { nullable: true })
  saturday_start_hours?: number;

  @Column('int', { nullable: true })
  saturday_end_hours?: number;

  @Column('int', { nullable: true })
  sunday_start_hours?: number;

  @Column('int', { nullable: true })
  sunday_end_hours?: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  update_at: Date;
}
