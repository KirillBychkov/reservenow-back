import { User } from 'src/user/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

Entity();
export class Trainer {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User)
  @JoinColumn()
  user: User;

  @Column()
  hired_at: Date;

  @Column({ nullable: true })
  resigned_at?: Date;

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

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
