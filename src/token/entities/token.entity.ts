import { Account } from 'src/account/entities/account.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity()
export class Token {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => Account)
  @JoinColumn()
  account: Account;

  @Column({ nullable: true })
  refresh_token: string;

  @Column({ nullable: true })
  verify_token: string;

  @Column({ nullable: true })
  reset_token: string;

  @Column({ default: '0.0.0.0' })
  ip_adress: string;

  @Column({ nullable: true })
  user_agent: string;

  @Column('timestamp', { nullable: true })
  expire_at: Date;

  @CreateDateColumn()
  created_at: Date;
}
