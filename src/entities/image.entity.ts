import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { WorksDone } from './works-done.entity';

@Entity('images')
export class Image {
  @PrimaryGeneratedColumn({ name: 'imageId' })
  imageId: number;

  @Column({ name: 'worldId' })
  worldId: number;

  @Column({ type: 'varchar', length: 255, default: 'default' })
  path: string;

  @Column({ type: 'date' })
  date: Date;

  @Column({ type: 'smallint', default: 0 })
  hidden: number;

  @ManyToOne(() => WorksDone, (worksDone) => worksDone.images)
  @JoinColumn({ name: 'worldId' })
  work: WorksDone;
}
