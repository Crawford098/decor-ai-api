import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Profile } from './profile.entity';
import { Design } from './design.entity';
import { WorksDone } from './works-done.entity';
import { Palette } from './palette.entity';
import { Tag } from './tag.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn({ name: 'userId' })
  userId: number;

  @Column({ name: 'profileId' })
  profileId: number;

  @Column({ type: 'varchar', length: 255, default: 'default' })
  username: string;

  @Column({ type: 'varchar', length: 255, default: 'default' })
  password: string;

  @Column({ type: 'varchar', length: 255, default: 'default' })
  email: string;

  @Column({ type: 'varchar', length: 255, nullable: true, unique: true })
  googleId: string;

  @Column({ type: 'smallint', default: 0 })
  blocked: number;

  @Column({ type: 'text', nullable: true, default: 'default' })
  token: string;

  @Column({ type: 'smallint', default: 0 })
  hidden: number;

  @Column({ type: 'timestamp', nullable: true })
  created_at: Date;

  @ManyToOne(() => Profile, (profile) => profile.users)
  @JoinColumn({ name: 'profileId' })
  profile: Profile;

  @OneToMany(() => Design, (design) => design.user)
  designs: Design[];

  @OneToMany(() => WorksDone, (worksDone) => worksDone.user)
  works_done: WorksDone[];

  @OneToMany(() => Palette, (palette) => palette.user)
  palettes: Palette[];

  @OneToMany(() => Tag, (tag) => tag.user)
  tags: Tag[];
}
