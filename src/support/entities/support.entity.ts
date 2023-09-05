import { User } from 'src/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

enum SupportStatus {
  NEW = 'new',
  IN_PROGRESS = 'in_progress',
  FIXED = 'fixed',
  REJECTED = 'rejected',
}

@Entity()
export class Support {
  @PrimaryGeneratedColumn()
  id: number;
  @ManyToOne(() => User, (user) => user.id)
  user: User;

  @Column({ nullable: true })
  file?: string;

  @Column()
  client_description: string;

  @Column({ nullable: true })
  result_description?: string;

  @Column({ type: 'enum', enum: SupportStatus, default: SupportStatus.NEW })
  status: SupportStatus;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
