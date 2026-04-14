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
import { PaletteTag } from './palette-tag.entity';

@Entity('tags')
export class Tag {
  @PrimaryGeneratedColumn({ name: 'tagId' })
  tagId: number;

  @Column({ name: 'userId', nullable: true })
  userId: number;

  @Column({ type: 'varchar', length: 255, default: 'default' })
  name: string;

  @Column({ type: 'varchar', length: 50, default: 'SYSTEM' })
  created_by: string;

  @CreateDateColumn({ name: 'created_date', type: 'timestamp' })
  createdDate: Date;

  @Column({ type: 'smallint', default: 0 })
  hidden: number;

  @ManyToOne(() => User, (user) => user.tags, { nullable: true })
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToMany(() => PaletteTag, (paletteTag) => paletteTag.tag)
  paletteTags: PaletteTag[];
}
