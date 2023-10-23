import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Log {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  status: string;

  @Column()
  message: string;

  @Column()
  url: string;

  @CreateDateColumn()
  created_at: Date;
}
