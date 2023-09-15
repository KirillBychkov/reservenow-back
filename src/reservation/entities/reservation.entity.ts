import { Organization } from 'src/organization/entities/organization.entity';
import { RentalObject } from 'src/rental_object/entities/rental_object.entity';
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

  // TODO: Add when trainer entity is implemented
  //   ManyToOne(() => Trainer, (trainer) => trainer.id)
  //   user: Trainer;

  @ManyToOne(() => RentalObject, (rentalObject) => rentalObject.id)
  rental_object: RentalObject;

  @ManyToOne(() => Organization, (organization) => organization.id)
  organization: RentalObject;

  @Column()
  reservetion_time_start: Date;

  @Column()
  reservetion_time_end: Date;

  @Column('text')
  description: string;

  @Column()
  price: number;

  // TODO: Add when order is implemented
  //   @ManyToOne(() => OrderedBulkOperation, (order) => order.id)
  //   order: Order

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  update_at: Date;
}
