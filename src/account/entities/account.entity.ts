import { Manager } from 'src/manager/entities/manager.entity';
import { Role } from 'src/role/entities/role.entity';
import { Trainer } from 'src/trainer/entities/trainer.entity';
import { User } from 'src/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

enum AccountStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  BLOCKED = 'blocked',
  DELETED = 'deleted',
}

@Entity()
export class Account {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true, select: false })
  password?: string;

  @OneToOne(() => User, (user) => user.account, { nullable: true })
  @JoinColumn()
  user?: User;

  @OneToOne(() => Manager, (manager) => manager.account, { nullable: true })
  @JoinColumn()
  manager?: Manager;

  @OneToOne(() => Trainer, (trainer) => trainer.account, { nullable: true })
  @JoinColumn()
  trainer?: Trainer;

  @ManyToOne(() => Role, (role) => role.id)
  role: Role;

  @Column({ type: 'enum', enum: AccountStatus, default: AccountStatus.ACTIVE })
  status: AccountStatus;

  @CreateDateColumn()
  created_at: Date;
  @UpdateDateColumn()
  updated_at: Date;
}
