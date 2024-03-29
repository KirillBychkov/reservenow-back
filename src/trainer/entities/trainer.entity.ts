import { Account } from 'src/account/entities/account.entity';
import { Reservation } from 'src/reservation/entities/reservation.entity';
import { User } from 'src/user/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';

@Entity()
export class Trainer {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.id, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  @OneToMany(() => Reservation, (reservation) => reservation.trainer)
  reservations: Reservation[];

  @Column()
  first_name: string;

  @Column()
  last_name: string;

  @Column()
  phone: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  image?: string;

  @Column({ nullable: true })
  hired_at: Date;

  @Column({ nullable: true })
  resigned_at?: Date;

  @OneToOne(() => Account, (account) => account.trainer, { onDelete: 'CASCADE' })
  account: Account;

  @Column('int')
  price_per_hour: number;

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

  @Column({ type: 'float', nullable: true, select: false })
  total_reservation_sum: number;

  @Column({ type: 'int', nullable: true, select: false })
  total_reservation_amount: number;

  @Column({ type: 'int', nullable: true, select: false })
  total_clients_amount: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
