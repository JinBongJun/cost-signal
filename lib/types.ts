/**
 * Shared type definitions
 * Centralized type definitions for better type safety
 */

/**
 * Session user type
 * Extends NextAuth's default user type
 */
export interface SessionUser {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
}

/**
 * Paddle webhook event types
 */
export type PaddleWebhookEvent =
  | {
      event_type: 'subscription.created' | 'subscription.updated';
      data: PaddleSubscriptionData;
    }
  | {
      event_type: 'subscription.canceled';
      data: PaddleSubscriptionData;
    }
  | {
      event_type: 'transaction.completed';
      data: PaddleTransactionData;
    };

export interface PaddleSubscriptionData {
  id: string;
  customer_id: string;
  status: 'active' | 'canceled' | 'past_due' | 'paused' | 'trialing';
  items?: Array<{
    price_id: string;
    quantity: number;
  }>;
  current_billing_period?: {
    starts_at: string;
    ends_at: string;
  };
  scheduled_change?: {
    action: 'cancel' | 'pause' | 'resume';
  };
  custom_data?: {
    user_id?: string;
  };
}

export interface PaddleTransactionData {
  id: string;
  subscription_id?: string;
  customer_id: string;
  status: string;
  total: string;
  currency_code: string;
  created_at: string;
}

/**
 * Database interface type
 * Used for dependency injection
 */
export interface Database {
  saveSubscription(data: {
    id?: string;
    user_id: string;
    stripe_subscription_id: string;
    stripe_customer_id: string;
    status: string;
    plan: string;
    current_period_start: number;
    current_period_end: number;
    cancel_at_period_end: boolean;
  }): Promise<void>;
  getSubscriptionByStripeId(subscriptionId: string): Promise<any>;
}

