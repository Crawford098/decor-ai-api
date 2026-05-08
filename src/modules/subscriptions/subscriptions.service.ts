import {
  Injectable,
  Logger,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Subscription, SubscriptionStatus, SubscriptionStore } from '../../entities/subscription.entity';
import { SubscriptionEvent } from '../../entities/subscription-event.entity';
import { SubscriptionResponseDto } from './dto/subscription.dto';
import {
  RevenueCatWebhookPayload,
  RevenueCatWebhookEvent,
  RevenueCatStore,
} from './interfaces/revenuecat-webhook.interface';

@Injectable()
export class SubscriptionsService {
  private readonly logger = new Logger(SubscriptionsService.name);

  constructor(
    @InjectRepository(Subscription)
    private readonly subscriptionRepository: Repository<Subscription>,
    @InjectRepository(SubscriptionEvent)
    private readonly subscriptionEventRepository: Repository<SubscriptionEvent>,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Validates the Authorization header sent by RevenueCat on webhook requests.
   */
  validateWebhookToken(authHeader: string | undefined): void {
    const expectedToken = this.configService.get<string>('REVENUECAT_WEBHOOK_AUTH_TOKEN');
    if (!expectedToken) {
      this.logger.warn('REVENUECAT_WEBHOOK_AUTH_TOKEN is not configured');
      return;
    }
    if (!authHeader || authHeader !== `Bearer ${expectedToken}`) {
      throw new UnauthorizedException('Invalid webhook authorization token');
    }
  }

  /**
   * Processes an incoming RevenueCat webhook payload.
   * Idempotent: duplicate event IDs are safely ignored.
   */
  async processWebhook(payload: RevenueCatWebhookPayload): Promise<void> {
    const event = payload.event;

    // Idempotency: skip already-processed events
    const existing = await this.subscriptionEventRepository.findOne({
      where: { externalEventId: event.id },
    });

    if (existing) {
      this.logger.log(`Duplicate webhook event ${event.id} — skipping`);
      return;
    }

    // Parse userId from app_user_id (we store userId as string in RevenueCat)
    const userId = this.parseUserId(event.app_user_id);

    // Persist raw event for audit / debugging
    await this.subscriptionEventRepository.save({
      externalEventId: event.id,
      userId,
      eventType: event.type,
      provider: 'revenuecat',
      payload: payload as unknown as Record<string, unknown>,
      processedAt: new Date(),
    });

    // Update subscription state based on event type
    if (userId !== null) {
      await this.upsertSubscription(userId, event);
    } else {
      this.logger.warn(`Could not parse userId from app_user_id: ${event.app_user_id}`);
    }
  }

  /**
   * Returns the active subscription status for a given user.
   */
  async getSubscriptionByUserId(userId: number): Promise<SubscriptionResponseDto> {
    const subscription = await this.subscriptionRepository.findOne({
      where: { userId },
      order: { updatedAt: 'DESC' },
    });

    if (!subscription) {
      return this.buildEmptyResponse();
    }

    const isPremium = this.isActiveStatus(subscription.status);

    return {
      isPremium,
      entitlements: isPremium ? [subscription.entitlement] : [],
      status: subscription.status,
      productId: subscription.productId,
      store: subscription.store,
      expiresAt: subscription.expiresAt,
      willRenew: subscription.willRenew,
    };
  }

  /**
   * Returns true if the user currently has an active premium subscription.
   */
  async isPremium(userId: number): Promise<boolean> {
    const response = await this.getSubscriptionByUserId(userId);
    return response.isPremium;
  }

  // ─── Private helpers ────────────────────────────────────────────────────────

  private async upsertSubscription(
    userId: number,
    event: RevenueCatWebhookEvent,
  ): Promise<void> {
    const status = this.mapEventToStatus(event);

    // Skip non-subscription events that carry no product info
    if (!event.product_id) {
      return;
    }

    const existing = await this.subscriptionRepository.findOne({ where: { userId } });

    const subscriptionData: Partial<Subscription> = {
      userId,
      provider: 'revenuecat',
      store: this.mapStore(event.store),
      productId: event.product_id,
      entitlement: event.entitlement_ids?.[0] ?? event.entitlement_id ?? 'pro',
      status,
      expiresAt: event.expiration_at_ms ? new Date(event.expiration_at_ms) : null,
      willRenew: this.resolveWillRenew(event),
      originalTransactionId: event.original_transaction_id,
      latestTransactionId: event.transaction_id,
      environment: event.environment === 'SANDBOX' ? 'sandbox' : 'production',
    };

    if (existing) {
      await this.subscriptionRepository.update(existing.subscriptionId, subscriptionData);
      this.logger.log(`Updated subscription for userId=${userId} — status=${status}`);
    } else {
      await this.subscriptionRepository.save(subscriptionData);
      this.logger.log(`Created subscription for userId=${userId} — status=${status}`);
    }
  }

  private mapEventToStatus(event: RevenueCatWebhookEvent): SubscriptionStatus {
    switch (event.type) {
      case 'INITIAL_PURCHASE':
      case 'RENEWAL':
      case 'UNCANCELLATION':
      case 'NON_RENEWING_PURCHASE':
        return 'active';

      case 'BILLING_ISSUE':
      case 'SUBSCRIPTION_PAUSED':
        // Keep access during grace period
        return 'grace_period';

      case 'CANCELLATION':
        // Cancelled but may still have time left
        return 'cancelled';

      case 'EXPIRATION':
        return 'expired';

      default:
        return 'expired';
    }
  }

  private mapStore(store: RevenueCatStore): SubscriptionStore {
    switch (store) {
      case 'APP_STORE':
        return 'app_store';
      case 'PLAY_STORE':
        return 'play_store';
      case 'STRIPE':
        return 'stripe';
      default:
        return 'app_store';
    }
  }

  private resolveWillRenew(event: RevenueCatWebhookEvent): boolean {
    return (
      event.type === 'INITIAL_PURCHASE' ||
      event.type === 'RENEWAL' ||
      event.type === 'UNCANCELLATION'
    );
  }

  private isActiveStatus(status: SubscriptionStatus): boolean {
    return status === 'active' || status === 'trialing' || status === 'grace_period';
  }

  private parseUserId(appUserId: string): number | null {
    const parsed = parseInt(appUserId, 10);
    return isNaN(parsed) ? null : parsed;
  }

  private buildEmptyResponse(): SubscriptionResponseDto {
    return {
      isPremium: false,
      entitlements: [],
      status: null,
      productId: null,
      store: null,
      expiresAt: null,
      willRenew: false,
    };
  }
}
