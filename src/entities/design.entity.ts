import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { WorksDone } from './works-done.entity';

@Entity('designs')
export class Design {
  @PrimaryGeneratedColumn({ name: 'designId' })
  designId: number;

  @Column({ name: 'userId' })
  userId: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  name: string;

  @Column({ type: 'text', nullable: true })
  pronts: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  img: string;

  @Column({ type: 'smallint', default: 0 })
  hidden: number;

  @ManyToOne(() => User, (user) => user.designs)
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToMany(() => WorksDone, (worksDone) => worksDone.design)
  works_done: WorksDone[];
}
