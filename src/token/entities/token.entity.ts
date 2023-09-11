import { Account } from 'src/account/entities/account.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  OneToOne,
} from 'typeorm';

@Entity()
export class Token {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => Account)
  @JoinColumn()
  account: Account;

  @Column({ nullable: true })
  access_token?: string;

  @Column({ nullable: true })
  refresh_token?: string;

  @Column({ nullable: true })
  verify_token?: string;

  @Column({ nullable: true })
  reset_token?: string;

  @Column({ default: '0.0.0.0' })
  ip_address: string;

  @Column({ nullable: true })
  user_agent?: string;

  @Column({ type: 'timestamp', nullable: true })
  expires_at?: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
