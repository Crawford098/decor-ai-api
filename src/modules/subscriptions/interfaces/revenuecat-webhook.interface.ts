export type RevenueCatEventType =
  | 'INITIAL_PURCHASE'
  | 'RENEWAL'
  | 'CANCELLATION'
  | 'UNCANCELLATION'
  | 'NON_RENEWING_PURCHASE'
  | 'SUBSCRIPTION_PAUSED'
  | 'EXPIRATION'
  | 'BILLING_ISSUE'
  | 'PRODUCT_CHANGE'
  | 'TRANSFER'
  | 'TEST';

export type RevenueCatStore =
  | 'APP_STORE'
  | 'PLAY_STORE'
  | 'STRIPE'
  | 'PROMOTIONAL'
  | 'AMAZON';

export type RevenueCatEnvironment = 'SANDBOX' | 'PRODUCTION';

export interface RevenueCatSubscriberAttribute {
  value: string;
  updated_at_ms: number;
}

export interface RevenueCatWebhookEvent {
  /** Unique event ID — used for idempotency */
  id: string;
  type: RevenueCatEventType;
  /** RevenueCat app_user_id (should match our backend userId as string) */
  app_user_id: string;
  /** Original app_user_id (before any alias) */
  original_app_user_id: string;
  aliases: string[];
  product_id: string;
  entitlement_id: string | null;
  entitlement_ids: string[] | null;
  store: RevenueCatStore;
  environment: RevenueCatEnvironment;
  is_trial_conversion?: boolean;
  cancel_reason?: string;
  expiration_reason?: string;
  expiration_at_ms: number | null;
  purchased_at_ms: number;
  grace_period_expiration_at_ms?: number | null;
  auto_resume_at_ms?: number | null;
  original_transaction_id: string | null;
  transaction_id: string | null;
  presented_offering_id: string | null;
  period_type: 'NORMAL' | 'TRIAL' | 'INTRO';
  price: number | null;
  currency: string | null;
  price_in_purchased_currency: number | null;
  takehome_percentage: number | null;
  subscriber_attributes?: Record<string, RevenueCatSubscriberAttribute>;
  commission_percentage?: number | null;
  country_code?: string | null;
}

export interface RevenueCatWebhookPayload {
  api_version: string;
  event: RevenueCatWebhookEvent;
}
