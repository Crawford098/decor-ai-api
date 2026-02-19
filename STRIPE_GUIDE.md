# Stripe Integration Guide

This project includes a complete Stripe payment integration with support for checkout sessions, payment intents, customers, refunds, and webhooks.

## Setup

### 1. Install Dependencies
```bash
npm install stripe
```

### 2. Configure Environment Variables
Add the following to your `.env` file:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

**Getting your Stripe keys:**
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Navigate to **Developers > API keys**
3. Copy your **Secret key** (starts with `sk_test_` for test mode)
4. For webhooks, go to **Developers > Webhooks** and create a new endpoint
5. Copy the **Signing secret** (starts with `whsec_`)

## API Endpoints

### Checkout Sessions

#### Create Checkout Session
```http
POST /api/payments/checkout
Content-Type: application/json

{
  "amount": 5000,              // Amount in cents ($50.00)
  "currency": "usd",
  "productName": "AI Design Service",
  "successUrl": "https://yourdomain.com/success?session_id={CHECKOUT_SESSION_ID}",
  "cancelUrl": "https://yourdomain.com/cancel",
  "metadata": {
    "userId": "123",
    "designId": "456"
  }
}
```

**Or use an existing price:**
```json
{
  "priceId": "price_1234567890",
  "successUrl": "https://yourdomain.com/success",
  "cancelUrl": "https://yourdomain.com/cancel"
}
```

**Response:**
```json
{
  "sessionId": "cs_test_...",
  "url": "https://checkout.stripe.com/c/pay/cs_test_..."
}
```

#### Get Checkout Session
```http
GET /api/payments/checkout/:sessionId
```

### Payment Intents (Custom Payment Flows)

#### Create Payment Intent
```http
POST /api/payments/intent
Content-Type: application/json

{
  "amount": 2500,              // Amount in cents ($25.00)
  "currency": "usd",
  "description": "Custom design payment",
  "customerId": "cus_1234567890",  // Optional
  "metadata": {
    "orderId": "789"
  }
}
```

**Response:**
```json
{
  "clientSecret": "pi_xxx_secret_yyy",
  "paymentIntentId": "pi_1234567890"
}
```

#### Get Payment Intent
```http
GET /api/payments/intent/:paymentIntentId
```

### Customers

#### Create Customer
```http
POST /api/payments/customers
Content-Type: application/json

{
  "email": "customer@example.com",
  "name": "John Doe",
  "metadata": {
    "userId": "123"
  }
}
```

#### Get Customer
```http
GET /api/payments/customers/:customerId
```

#### List All Customers
```http
GET /api/payments/customers?limit=20
```

#### List Customer Payments
```http
GET /api/payments/customers/:customerId/payments?limit=10
```

### Refunds

#### Create Refund
```http
POST /api/payments/refunds
Content-Type: application/json

{
  "paymentIntentId": "pi_1234567890",
  "amount": 1000  // Optional: partial refund in cents, omit for full refund
}
```

### Webhooks

#### Webhook Endpoint
```http
POST /api/payments/webhook
```

**Handled Events:**
- `checkout.session.completed` - Checkout session completed successfully
- `payment_intent.succeeded` - Payment succeeded
- `payment_intent.payment_failed` - Payment failed
- `customer.created` - New customer created

**Configure in Stripe Dashboard:**
1. Go to **Developers > Webhooks**
2. Click **Add endpoint**
3. Set endpoint URL: `https://yourdomain.com/api/payments/webhook`
4. Select events to listen to
5. Copy the **Signing secret** to your `.env` file

## Usage Examples

### Frontend Integration Example (React)

```javascript
// Create checkout session
const handleCheckout = async () => {
  const response = await fetch('http://localhost:3000/api/payments/checkout', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: 5000,
      currency: 'usd',
      productName: 'AI Design Service',
      successUrl: `${window.location.origin}/success`,
      cancelUrl: `${window.location.origin}/cancel`,
    }),
  });

  const { url } = await response.json();
  
  // Redirect to Stripe Checkout
  window.location.href = url;
};
```

### Payment Intent with Stripe Elements

```javascript
// 1. Create payment intent
const createPaymentIntent = async () => {
  const response = await fetch('http://localhost:3000/api/payments/intent', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: 2500,
      currency: 'usd',
    }),
  });

  const { clientSecret } = await response.json();
  return clientSecret;
};

// 2. Use with Stripe Elements
const stripe = Stripe('pk_test_your_publishable_key');
const clientSecret = await createPaymentIntent();

// Initialize payment element
// ... (see Stripe Elements documentation)
```

## Testing

Use Stripe test cards:

| Card Number         | Description           |
|--------------------|-----------------------|
| 4242 4242 4242 4242 | Successful payment   |
| 4000 0000 0000 0002 | Card declined        |
| 4000 0025 0000 3155 | Requires authentication |

## Service Functions

The `stripe.service.ts` provides the following functions:

- `createCheckoutSession()` - Create a checkout session
- `createPaymentIntent()` - Create a payment intent
- `retrieveCheckoutSession()` - Get session details
- `retrievePaymentIntent()` - Get payment intent details
- `createCustomer()` - Create a Stripe customer
- `retrieveCustomer()` - Get customer details
- `listCustomers()` - List all customers
- `createRefund()` - Create a refund
- `listCustomerPayments()` - List customer's payments
- `constructWebhookEvent()` - Verify webhook signature

## Security Notes

1. **Never expose your secret key** - Only use it server-side
2. **Always verify webhook signatures** - Prevent fake webhook requests
3. **Use HTTPS in production** - Required for webhooks
4. **Validate amounts server-side** - Never trust client-provided amounts
5. **Store customer IDs** - Link Stripe customers to your users in the database

## Database Integration (Optional)

Consider creating a `payments` table to track transactions:

```prisma
model Payment {
  paymentId        Int      @id @default(autoincrement())
  userId           Int
  stripeSessionId  String?  @unique
  stripePaymentId  String?  @unique
  amount           Int      // in cents
  currency         String   @default("usd")
  status           String   // succeeded, pending, failed
  metadata         Json?
  createdAt        DateTime @default(now())
  
  user             User     @relation(fields: [userId], references: [userId])
}
```

Then update the webhook handler to save payment records to your database.

## Resources

- [Stripe API Documentation](https://stripe.com/docs/api)
- [Stripe Testing](https://stripe.com/docs/testing)
- [Stripe Webhooks](https://stripe.com/docs/webhooks)
- [Stripe Elements](https://stripe.com/docs/stripe-js)
