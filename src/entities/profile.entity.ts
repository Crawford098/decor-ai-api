import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
} from 'typeorm';
import { User } from './user.entity';

@Entity('profile')
export class Profile {
  @PrimaryGeneratedColumn({ name: 'profileId' })
  profileId: number;

  @Column({ type: 'varchar', length: 255, default: 'default' })
  first_name: string;

  @Column({ type: 'varchar', length: 255, default: 'default' })
  last_name: string;

  @Column({ type: 'smallint', default: 0 })
  hidden: number;

  @OneToMany(() => User, (user) => user.profile)
  users: User[];
}
