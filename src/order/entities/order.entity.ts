import { Client } from 'src/client/entities/client.entity';
import { Reservation } from 'src/reservation/entities/reservation.entity';
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

export enum OrderStatus {
  PENDING = 'pending',
  NOT_PAID = 'not_paid',
  PAID = 'paid',
  REJECTED = 'rejected',
}

export enum OrderPaymentMethod {
  CASH = 'cash',
  CARD = 'card',
}

@Entity()
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.id)
  user: User;

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
  status: OrderStatus;

  @Column({ type: 'enum', enum: OrderPaymentMethod })
  payment_method: OrderPaymentMethod;

  //TODO: GROUP_ID

  @OneToMany(() => Reservation, (reservation) => reservation.order)
  reservations: Reservation[];

  @ManyToOne(() => Client, (client) => client.id)
  client: Client;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
