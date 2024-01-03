import { Equipment } from 'src/equipment/entities/equipment.entity';
import { Order } from 'src/order/entities/order.entity';
import { RentalObject } from 'src/rental_object/entities/rental_object.entity';
import { Trainer } from 'src/trainer/entities/trainer.entity';
import { User } from 'src/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Reservation {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.id)
  user: User;

  @ManyToOne(() => Trainer, (trainer) => trainer.id, { nullable: true })
  trainer?: Trainer;

  @ManyToOne(() => RentalObject, (rentalObject) => rentalObject.id, { nullable: true })
  rental_object?: RentalObject;

  @ManyToOne(() => Equipment, (equipment) => equipment.id, { nullable: true })
  equipment?: Equipment;

  // @ManyToOne(() => Organization, (organization) => organization.id, )
  // organization: RentalObject;

  @Column({ nullable: true })
  reservation_time_start: Date;

  @Column({ nullable: true })
  reservation_time_end: Date;

  @Column('text', { nullable: true })
  description?: string;

  @Column()
  price: number;

  @ManyToOne(() => Order, (order) => order.id, { onDelete: 'CASCADE' })
  order: Order;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
