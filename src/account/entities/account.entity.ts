import { IsEmail } from 'class-validator';
import { Role } from 'src/role/entities/role.entity';
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
  @IsEmail()
  email: string;

  @Column({ nullable: true, select: false })
  password: string;

  @OneToOne(() => User, { nullable: true })
  @JoinColumn()
  user: User;

  @OneToOne(() => User, { nullable: true })
  @JoinColumn()
  manager: User;

  @OneToOne(() => User, { nullable: true })
  @JoinColumn()
  trainer: User;

  @ManyToOne(() => Role, (role) => role.id)
  role: Role;

  @Column({ type: 'enum', enum: AccountStatus, default: AccountStatus.ACTIVE })
  status: AccountStatus;

  @CreateDateColumn()
  created_at: Date;
  @UpdateDateColumn()
  updated_at: Date;
}
