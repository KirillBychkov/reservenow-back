import { Account } from 'src/account/entities/account.entity';
import { User } from 'src/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Manager {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.id, { onDelete: 'CASCADE' })
  user: User;

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

  @OneToOne(() => Account, (account) => account.manager, { onDelete: 'CASCADE' })
  account: Account;

  @Column({ nullable: true })
  resigned_at?: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
