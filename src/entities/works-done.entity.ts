import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Design } from './design.entity';
import { Palette } from './palette.entity';
import { User } from './user.entity';
import { Image } from './image.entity';

@Entity('works_done')
export class WorksDone {
  @PrimaryGeneratedColumn({ name: 'worldId' })
  worldId: number;

  @Column({ name: 'designId', default: 0 })
  designId: number;

  @Column({ name: 'paletteId', default: 0 })
  paletteId: number;

  @Column({ name: 'userId', default: 0 })
  userId: number;

  @Column({ type: 'text', nullable: true, default: 'default' })
  final_pront: string;

  @Column({ type: 'smallint', default: 0 })
  hidden: number;

  @ManyToOne(() => Design, (design) => design.works_done)
  @JoinColumn({ name: 'designId' })
  design: Design;

  @ManyToOne(() => Palette, (palette) => palette.works_done)
  @JoinColumn({ name: 'paletteId' })
  palette: Palette;

  @ManyToOne(() => User, (user) => user.works_done)
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToMany(() => Image, (image) => image.work)
  images: Image[];
}
