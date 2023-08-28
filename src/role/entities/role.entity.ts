import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column('varchar', { array: true })
  permissions: string[];

  @Column('timestamp')
  created_at: Date;

  @Column('timestamp')
  updated_at: Date;
}
