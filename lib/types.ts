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
      event_type: 'subscription.canceled' | 'subscription.past_due' | 'subscription.paused';
      data: PaddleSubscriptionData;
    }
  | {
      event_type: 'transaction.completed' | 'transaction.refunded' | 'transaction.payment_failed';
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
  next_billed_at?: string;
}

export interface PaddleTransactionData {
  id: string;
  subscription_id?: string;
  customer_id: string;
  status: string;
  total: string;
  totals?: {
    total: string;
    currency_code?: string;
  };
  currency_code: string;
  created_at: string;
  refunded?: boolean;
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
  getUserById(userId: string): Promise<any | null>;
}

/**
 * Spending pattern types for personalized impact analysis
 */
export interface SpendingPattern {
  gas_frequency?: 'daily' | 'weekly' | 'biweekly' | 'monthly' | null;
  monthly_rent?: number | null;
  food_ratio?: 'low' | 'medium' | 'high' | null;
  transport_mode?: 'car' | 'public' | 'mixed' | null;
  has_debt?: boolean | null;
}

/**
 * Impact analysis result with spending pattern and average comparison
 */
export interface ImpactAnalysis {
  totalWeeklyChange: number;
  breakdown: Array<{
    indicator: 'gas' | 'cpi' | 'interest_rate' | 'unemployment';
    impact: number;
    level: 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';
    context?: string;
  }>;
  spendingPattern?: SpendingPattern;
  averageImpact?: {
    totalWeeklyChange: number;
    breakdown: Array<{
      indicator: 'gas' | 'cpi' | 'interest_rate' | 'unemployment';
      impact: number;
      level: 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';
    }>;
  };
  insights?: ActionableInsight[];
  predictions?: Prediction[];
  savingsOpportunities?: SavingsOpportunity[];
}

/**
 * Actionable insight that helps users save money
 */
export interface ActionableInsight {
  id: string;
  type: 'gas' | 'cpi' | 'interest_rate' | 'general';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  action: string; // What the user should do
  potentialSavings: number; // Weekly savings in dollars
  urgency: 'now' | 'this_week' | 'soon';
  icon: string;
}

/**
 * Prediction for next week
 */
export interface Prediction {
  indicator: 'gas' | 'cpi' | 'interest_rate' | 'unemployment';
  direction: 'up' | 'down' | 'stable';
  confidence: 'high' | 'medium' | 'low';
  expectedChange: number; // Percentage change
  recommendation: string;
  timing: 'optimal' | 'good' | 'avoid';
}

/**
 * Savings opportunity based on pattern changes
 */
export interface SavingsOpportunity {
  id: string;
  title: string;
  description: string;
  currentPattern: string;
  suggestedChange: string;
  weeklySavings: number;
  monthlySavings: number;
  difficulty: 'easy' | 'medium' | 'hard';
  category: 'transport' | 'shopping' | 'debt' | 'lifestyle';
}

