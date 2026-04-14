import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class PaymentsService {
  private stripe: Stripe;

  constructor(private configService: ConfigService) {
    const secretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (secretKey) {
      this.stripe = new Stripe(secretKey, {
        apiVersion: '2023-10-16',
      });
    }
  }

  async createPaymentIntent(amount: number, currency: string = 'usd') {
    if (!this.stripe) {
      throw new Error('Stripe is not configured');
    }

    return this.stripe.paymentIntents.create({
      amount,
      currency,
    });
  }

  async createCustomer(email: string, name?: string) {
    if (!this.stripe) {
      throw new Error('Stripe is not configured');
    }

    return this.stripe.customers.create({
      email,
      name,
    });
  }

  verifyWebhookSignature(payload: string | Buffer, signature: string): Stripe.Event {
    const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');
    if (!this.stripe || !webhookSecret) {
      throw new Error('Stripe webhook is not configured');
    }

    return this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  }
}
