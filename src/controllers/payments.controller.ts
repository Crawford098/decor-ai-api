import { Request, Response } from 'express';
import * as stripeService from '../services/payments/stripe.service.js';
import { config } from '../config/env.js';

/**
 * Create a Stripe Checkout Session
 * POST /api/payments/checkout
 */
export const createCheckoutSession = async (req: Request, res: Response) => {
  try {
    const { amount, currency, productName, priceId, successUrl, cancelUrl, metadata, customerId } = req.body;

    // Validate required fields
    if (!successUrl || !cancelUrl) {
      return res.status(400).json({ 
        error: 'successUrl and cancelUrl are required' 
      });
    }

    if (!priceId && (!amount || !currency || !productName)) {
      return res.status(400).json({ 
        error: 'Either priceId or (amount, currency, productName) must be provided' 
      });
    }

    const session = await stripeService.createCheckoutSession({
      priceId,
      amount,
      currency,
      productName,
      successUrl,
      cancelUrl,
      metadata,
      customerId,
    });

    return res.status(200).json({ 
      sessionId: session.id,
      url: session.url 
    });
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    return res.status(500).json({ 
      error: 'Failed to create checkout session',
      message: error.message 
    });
  }
};

/**
 * Create a Payment Intent
 * POST /api/payments/intent
 */
export const createPaymentIntent = async (req: Request, res: Response) => {
  try {
    const { amount, currency, metadata, customerId, description } = req.body;

    if (!amount || !currency) {
      return res.status(400).json({ 
        error: 'Amount and currency are required' 
      });
    }

    const paymentIntent = await stripeService.createPaymentIntent({
      amount,
      currency,
      metadata,
      customerId,
      description,
    });

    return res.status(200).json({ 
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id 
    });
  } catch (error: any) {
    console.error('Error creating payment intent:', error);
    return res.status(500).json({ 
      error: 'Failed to create payment intent',
      message: error.message 
    });
  }
};

/**
 * Get Checkout Session details
 * GET /api/payments/checkout/:sessionId
 */
export const getCheckoutSession = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;

    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID is required' });
    }

    const session = await stripeService.retrieveCheckoutSession(sessionId);

    return res.status(200).json(session);
  } catch (error: any) {
    console.error('Error retrieving checkout session:', error);
    return res.status(500).json({ 
      error: 'Failed to retrieve checkout session',
      message: error.message 
    });
  }
};

/**
 * Get Payment Intent details
 * GET /api/payments/intent/:paymentIntentId
 */
export const getPaymentIntent = async (req: Request, res: Response) => {
  try {
    const { paymentIntentId } = req.params;

    if (!paymentIntentId) {
      return res.status(400).json({ error: 'Payment Intent ID is required' });
    }

    const paymentIntent = await stripeService.retrievePaymentIntent(paymentIntentId);

    return res.status(200).json(paymentIntent);
  } catch (error: any) {
    console.error('Error retrieving payment intent:', error);
    return res.status(500).json({ 
      error: 'Failed to retrieve payment intent',
      message: error.message 
    });
  }
};

/**
 * Create a Stripe Customer
 * POST /api/payments/customers
 */
export const createCustomer = async (req: Request, res: Response) => {
  try {
    const { email, name, metadata } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const customer = await stripeService.createCustomer(email, name, metadata);

    return res.status(201).json(customer);
  } catch (error: any) {
    console.error('Error creating customer:', error);
    return res.status(500).json({ 
      error: 'Failed to create customer',
      message: error.message 
    });
  }
};

/**
 * Get Customer details
 * GET /api/payments/customers/:customerId
 */
export const getCustomer = async (req: Request, res: Response) => {
  try {
    const { customerId } = req.params;

    if (!customerId) {
      return res.status(400).json({ error: 'Customer ID is required' });
    }

    const customer = await stripeService.retrieveCustomer(customerId);

    return res.status(200).json(customer);
  } catch (error: any) {
    console.error('Error retrieving customer:', error);
    return res.status(500).json({ 
      error: 'Failed to retrieve customer',
      message: error.message 
    });
  }
};

/**
 * List all Customers
 * GET /api/payments/customers
 */
export const listCustomers = async (req: Request, res: Response) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

    const customers = await stripeService.listCustomers(limit);

    return res.status(200).json(customers);
  } catch (error: any) {
    console.error('Error listing customers:', error);
    return res.status(500).json({ 
      error: 'Failed to list customers',
      message: error.message 
    });
  }
};

/**
 * Create a Refund
 * POST /api/payments/refunds
 */
export const createRefund = async (req: Request, res: Response) => {
  try {
    const { paymentIntentId, amount } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({ error: 'Payment Intent ID is required' });
    }

    const refund = await stripeService.createRefund(paymentIntentId, amount);

    return res.status(200).json(refund);
  } catch (error: any) {
    console.error('Error creating refund:', error);
    return res.status(500).json({ 
      error: 'Failed to create refund',
      message: error.message 
    });
  }
};

/**
 * List Customer Payments
 * GET /api/payments/customers/:customerId/payments
 */
export const listCustomerPayments = async (req: Request, res: Response) => {
  try {
    const { customerId } = req.params;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

    if (!customerId) {
      return res.status(400).json({ error: 'Customer ID is required' });
    }

    const payments = await stripeService.listCustomerPayments(customerId, limit);

    return res.status(200).json(payments);
  } catch (error: any) {
    console.error('Error listing customer payments:', error);
    return res.status(500).json({ 
      error: 'Failed to list customer payments',
      message: error.message 
    });
  }
};

/**
 * Stripe Webhook Handler
 * POST /api/payments/webhook
 */
export const handleWebhook = async (req: Request, res: Response) => {
  try {
    const signature = req.headers['stripe-signature'] as string;

    if (!signature) {
      return res.status(400).json({ error: 'No signature provided' });
    }

    if (!config.stripe.webhookSecret) {
      return res.status(500).json({ error: 'Webhook secret not configured' });
    }

    // Construct the event using the raw body
    const event = stripeService.constructWebhookEvent(
      req.body,
      signature,
      config.stripe.webhookSecret
    );

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        console.log('Checkout session completed:', session.id);
        // Add your business logic here (e.g., fulfill order, update database)
        break;

      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        console.log('Payment succeeded:', paymentIntent.id);
        // Add your business logic here
        break;

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object;
        console.log('Payment failed:', failedPayment.id);
        // Add your business logic here
        break;

      case 'customer.created':
        const customer = event.data.object;
        console.log('Customer created:', customer.id);
        // Add your business logic here
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return res.status(200).json({ received: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return res.status(400).json({ 
      error: 'Webhook error',
      message: error.message 
    });
  }
};
