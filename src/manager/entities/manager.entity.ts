import { User } from 'src/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Manager {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User)
  @JoinColumn()
  user: User;

  @Column('timestamp')
  hiredAt: Date;

  @Column('timestamp', { nullable: true })
  resignedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
