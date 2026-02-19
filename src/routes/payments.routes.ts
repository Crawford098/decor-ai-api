import express from 'express';
import { 
  createCheckoutSession, 
  createPaymentIntent, 
  getCheckoutSession, 
  getPaymentIntent,
  createCustomer,
  getCustomer,
  listCustomers,
  createRefund,
  listCustomerPayments,
  handleWebhook
} from '../controllers/payments.controller.js';

const router = express.Router();

// Checkout Sessions
router.post('/checkout', createCheckoutSession);
router.get('/checkout/:sessionId', getCheckoutSession);

// Payment Intents
router.post('/intent', createPaymentIntent);
router.get('/intent/:paymentIntentId', getPaymentIntent);

// Customers
router.post('/customers', createCustomer);
router.get('/customers', listCustomers);
router.get('/customers/:customerId', getCustomer);
router.get('/customers/:customerId/payments', listCustomerPayments);

// Refunds
router.post('/refunds', createRefund);

// Webhooks (raw body parser is handled in app.ts)
router.post('/webhook', handleWebhook);

export default router;
