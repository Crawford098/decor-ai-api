import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  CreateDateColumn,
} from 'typeorm';

@Entity('subscription_events')
export class SubscriptionEvent {
  @PrimaryGeneratedColumn({ name: 'eventId' })
  eventId: number;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 500 })
  externalEventId: string;

  @Column({ name: 'userId', nullable: true })
  userId: number | null;

  @Column({ type: 'varchar', length: 100 })
  eventType: string;

  @Column({ type: 'varchar', length: 50, default: 'revenuecat' })
  provider: string;

  @Column({ type: 'jsonb' })
  payload: Record<string, unknown>;

  @Column({ type: 'timestamp', nullable: true })
  processedAt: Date | null;

  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;
}
