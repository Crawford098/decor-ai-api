import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

export type SubscriptionStatus =
  | 'active'
  | 'trialing'
  | 'grace_period'
  | 'expired'
  | 'cancelled';

export type SubscriptionStore = 'app_store' | 'play_store' | 'stripe';

export type SubscriptionEnvironment = 'sandbox' | 'production';

@Entity('subscriptions')
export class Subscription {
  @PrimaryGeneratedColumn({ name: 'subscriptionId' })
  subscriptionId: number;

  @Column({ name: 'userId' })
  userId: number;

  @Column({ type: 'varchar', length: 50, default: 'revenuecat' })
  provider: string;

  @Column({ type: 'varchar', length: 50 })
  store: SubscriptionStore;

  @Column({ type: 'varchar', length: 255 })
  productId: string;

  @Column({ type: 'varchar', length: 100 })
  entitlement: string;

  @Column({ type: 'varchar', length: 50 })
  status: SubscriptionStatus;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt: Date | null;

  @Column({ type: 'boolean', default: false })
  willRenew: boolean;

  @Column({ type: 'varchar', length: 500, nullable: true })
  originalTransactionId: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  latestTransactionId: string | null;

  @Column({ type: 'varchar', length: 20, default: 'production' })
  environment: SubscriptionEnvironment;

  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updatedAt' })
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.subscriptions)
  @JoinColumn({ name: 'userId' })
  user: User;
}
