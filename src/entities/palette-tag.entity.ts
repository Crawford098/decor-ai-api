import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Unique,
} from 'typeorm';
import { Tag } from './tag.entity';
import { Palette } from './palette.entity';

@Entity('palette_tags')
@Unique(['tagId', 'paletteId'])
export class PaletteTag {
  @PrimaryGeneratedColumn({ name: 'paletteTagId' })
  paletteTagId: number;

  @Column({ name: 'tagId' })
  tagId: number;

  @Column({ name: 'paletteId' })
  paletteId: number;

  @CreateDateColumn({ name: 'created_date', type: 'timestamp' })
  createdDate: Date;

  @Column({ type: 'smallint', default: 0 })
  hidden: number;

  @ManyToOne(() => Tag, (tag) => tag.paletteTags)
  @JoinColumn({ name: 'tagId' })
  tag: Tag;

  @ManyToOne(() => Palette, (palette) => palette.paletteTags)
  @JoinColumn({ name: 'paletteId' })
  palette: Palette;
}
