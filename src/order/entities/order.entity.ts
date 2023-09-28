import { Client } from 'src/client/entities/client.entity';
import { User } from 'src/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum OrderStatus {
  PENDING = 'pending',
  NOT_PAID = 'not_paid',
  PAID = 'paid',
  REJECTED = 'rejected',
}

@Entity()
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.id)
  user: User;

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
  status: OrderStatus;

  //TODO: GROUP_ID

  @ManyToOne(() => Client, (client) => client.id)
  client: Client;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
