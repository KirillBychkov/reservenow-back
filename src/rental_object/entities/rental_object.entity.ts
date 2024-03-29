import { Organization } from 'src/organization/entities/organization.entity';
import { Reservation } from 'src/reservation/entities/reservation.entity';
import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';

@Entity()
export class RentalObject {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('int')
  price_per_hour: number;

  @ManyToOne(() => Organization, (organization) => organization.rental_objects, {
    onDelete: 'CASCADE',
  })
  organization: Organization;

  @OneToMany(() => Reservation, (reservation) => reservation.rental_object)
  reservations: Reservation[];

  @Column()
  name: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ nullable: true })
  photo?: string;

  @Column()
  phone: string;

  @Column()
  address: string;
  // TODO: Unsigned int for all columns below

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

  @Column({ default: false })
  is_deleted: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  update_at: Date;

  @Column({ type: 'float', nullable: true, select: false })
  total_reservation_sum: number;

  @Column({ type: 'int', nullable: true, select: false })
  total_reservation_amount: number;

  @Column({ type: 'int', nullable: true, select: false })
  total_clients_amount: number;
}
