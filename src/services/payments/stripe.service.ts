import Stripe from 'stripe';
import { config } from '../../config/env.js';

if (!config.stripe.secretKey) {
  throw new Error('STRIPE_SECRET_KEY is not defined in environment variables');
}

const stripe = new Stripe(config.stripe.secretKey, {
  apiVersion: '2026-01-28.clover',
});

export interface CreateCheckoutSessionData {
  priceId?: string;
  amount?: number;
  currency?: string;
  productName?: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
  customerId?: string;
}

export interface CreatePaymentIntentData {
  amount: number;
  currency: string;
  metadata?: Record<string, string>;
  customerId?: string;
  description?: string;
}

/**
 * Create a Stripe Checkout Session
 */
export const createCheckoutSession = async (data: CreateCheckoutSessionData): Promise<Stripe.Checkout.Session> => {
  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    mode: 'payment',
    success_url: data.successUrl,
    cancel_url: data.cancelUrl,
    metadata: data.metadata,
  };

  // If customer ID is provided, attach it
  if (data.customerId) {
    sessionParams.customer = data.customerId;
  }

  // Use existing price ID or create ad-hoc price
  if (data.priceId) {
    sessionParams.line_items = [
      {
        price: data.priceId,
        quantity: 1,
      },
    ];
  } else if (data.amount && data.currency && data.productName) {
    sessionParams.line_items = [
      {
        price_data: {
          currency: data.currency,
          product_data: {
            name: data.productName,
          },
          unit_amount: data.amount, // Amount in cents
        },
        quantity: 1,
      },
    ];
  } else {
    throw new Error('Either priceId or (amount, currency, productName) must be provided');
  }

  return stripe.checkout.sessions.create(sessionParams);
};

/**
 * Create a Payment Intent (for custom payment flows)
 */
export const createPaymentIntent = async (data: CreatePaymentIntentData): Promise<Stripe.PaymentIntent> => {
  const paymentIntentParams: Stripe.PaymentIntentCreateParams = {
    amount: data.amount,
    currency: data.currency,
    metadata: data.metadata,
    description: data.description,
  };

  if (data.customerId) {
    paymentIntentParams.customer = data.customerId;
  }

  return stripe.paymentIntents.create(paymentIntentParams);
};

/**
 * Retrieve a Checkout Session
 */
export const retrieveCheckoutSession = async (sessionId: string): Promise<Stripe.Checkout.Session> => {
  return stripe.checkout.sessions.retrieve(sessionId);
};

/**
 * Retrieve a Payment Intent
 */
export const retrievePaymentIntent = async (paymentIntentId: string): Promise<Stripe.PaymentIntent> => {
  return stripe.paymentIntents.retrieve(paymentIntentId);
};

/**
 * Create a Stripe Customer
 */
export const createCustomer = async (email: string, name?: string, metadata?: Record<string, string>): Promise<Stripe.Customer> => {
  return stripe.customers.create({
    email,
    name,
    metadata,
  });
};

/**
 * Retrieve a Stripe Customer
 */
export const retrieveCustomer = async (customerId: string): Promise<Stripe.Customer | Stripe.DeletedCustomer> => {
  return stripe.customers.retrieve(customerId);
};

/**
 * List all Stripe Customers
 */
export const listCustomers = async (limit: number = 10): Promise<Stripe.ApiList<Stripe.Customer>> => {
  return stripe.customers.list({ limit });
};

/**
 * Create a refund
 */
export const createRefund = async (paymentIntentId: string, amount?: number): Promise<Stripe.Refund> => {
  const refundParams: Stripe.RefundCreateParams = {
    payment_intent: paymentIntentId,
  };

  if (amount) {
    refundParams.amount = amount;
  }

  return stripe.refunds.create(refundParams);
};

/**
 * Verify webhook signature
 */
export const constructWebhookEvent = (
  payload: string | Buffer,
  signature: string,
  webhookSecret: string
): Stripe.Event => {
  return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
};

/**
 * Get all payment intents for a customer
 */
export const listCustomerPayments = async (customerId: string, limit: number = 10): Promise<Stripe.ApiList<Stripe.PaymentIntent>> => {
  return stripe.paymentIntents.list({
    customer: customerId,
    limit,
  });
};

export default stripe;
