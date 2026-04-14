import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { WorksDone } from './works-done.entity';
import { PaletteTag } from './palette-tag.entity';

@Entity('palettes')
export class Palette {
  @PrimaryGeneratedColumn({ name: 'paletteId' })
  paletteId: number;

  @Column({ name: 'userId', nullable: true })
  userId: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text' })
  colors: string;

  @Column({ type: 'varchar', length: 50, default: 'SYSTEM' })
  created_by: string;

  @CreateDateColumn({ name: 'created_date', type: 'timestamp' })
  createdDate: Date;

  @Column({ type: 'smallint', default: 0 })
  hidden: number;

  @ManyToOne(() => User, (user) => user.palettes, { nullable: true })
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToMany(() => WorksDone, (worksDone) => worksDone.palette)
  works_done: WorksDone[];

  @OneToMany(() => PaletteTag, (paletteTag) => paletteTag.palette)
  paletteTags: PaletteTag[];
}
