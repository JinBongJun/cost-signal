import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { verifyWebhookSignature } from '@/lib/paddle';
import { sendPaymentFailedEmail, sendSubscriptionCreatedEmail, sendSubscriptionCanceledEmail } from '@/lib/email';
import type { PaddleWebhookEvent, PaddleSubscriptionData, PaddleTransactionData, Database } from '@/lib/types';

/**
 * POST /api/paddle/webhook
 * Handle Paddle webhook events
 * 
 * Events:
 * - subscription.created
 * - subscription.updated
 * - subscription.canceled
 * - subscription.past_due
 * - subscription.paused
 * - transaction.completed
 * - transaction.refunded
 * - transaction.payment_failed
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('paddle-signature') || '';

    // Verify webhook signature (uses PADDLE_WEBHOOK_SECRET from environment automatically)
    if (!verifyWebhookSignature(body, signature)) {
      console.error('Invalid webhook signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    let event: PaddleWebhookEvent;
    try {
      event = JSON.parse(body);
    } catch (error) {
      console.error('Invalid JSON in webhook body:', error);
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }
    const db = getDb() as Database;

    // Handle different event types
    switch (event.event_type) {
      case 'subscription.created':
      case 'subscription.updated':
        await handleSubscriptionUpdate(event.data, db);
        break;

      case 'subscription.canceled':
        await handleSubscriptionCanceled(event.data, db);
        break;

      case 'subscription.past_due':
        await handleSubscriptionPastDue(event.data, db);
        break;

      case 'subscription.paused':
        await handleSubscriptionPaused(event.data, db);
        break;

      case 'transaction.completed':
        await handleTransactionCompleted(event.data, db);
        break;

      case 'transaction.refunded':
        await handleTransactionRefunded(event.data, db);
        break;

      case 'transaction.payment_failed':
        await handleTransactionPaymentFailed(event.data, db);
        break;

      default: {
        // TypeScript exhaustive check
        const _exhaustive: never = event;
        console.log('Unhandled webhook event:', (_exhaustive as PaddleWebhookEvent).event_type);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handleSubscriptionUpdate(data: PaddleSubscriptionData, db: Database) {
  const subscription = data;
  const userId = subscription.custom_data?.user_id || subscription.customer_id;

  if (!userId) {
    console.error('No user ID in subscription data');
    return;
  }

  // Determine plan type
  let plan = 'monthly';
  if (subscription.items?.[0]?.price_id === process.env.PADDLE_PRICE_ID_YEARLY) {
    plan = 'yearly';
  }

  // Get billing period dates, fallback to current time if not available
  const now = Math.floor(Date.now() / 1000);
  const currentPeriodStart = subscription.current_billing_period?.starts_at
    ? Math.floor(new Date(subscription.current_billing_period.starts_at).getTime() / 1000)
    : now;
  const currentPeriodEnd = subscription.current_billing_period?.ends_at
    ? Math.floor(new Date(subscription.current_billing_period.ends_at).getTime() / 1000)
    : now + 30 * 24 * 60 * 60; // Default to 30 days from now if not available

  // Check if this is a new subscription
  const existing = await db.getSubscriptionByStripeId(subscription.id);
  const isNewSubscription = !existing;

  await db.saveSubscription({
    user_id: userId,
    stripe_subscription_id: subscription.id,
    stripe_customer_id: subscription.customer_id,
    status: subscription.status === 'active' ? 'active' : 'canceled',
    plan,
    current_period_start: currentPeriodStart,
    current_period_end: currentPeriodEnd,
    cancel_at_period_end: subscription.scheduled_change?.action === 'cancel',
  });

  // Send welcome email for new subscriptions
  if (isNewSubscription && subscription.status === 'active') {
    try {
      const user = await db.getUserById(userId);
      if (user?.email) {
        // Get amount from plan type (estimate based on plan)
        const planAmounts: Record<string, string> = {
          monthly: '5.99',
          yearly: '59.99',
        };
        const amount = planAmounts[plan] || '0';
        const currency = 'USD';
        const billingPeriod = plan === 'yearly' ? 'year' : 'month';
        
        await sendSubscriptionCreatedEmail(user.email, {
          plan: plan.charAt(0).toUpperCase() + plan.slice(1),
          amount,
          currency,
          billingPeriod,
        });
      }
    } catch (emailError) {
      console.error('Error sending subscription created email:', emailError);
      // Don't fail webhook if email fails
    }
  }
}

async function handleSubscriptionCanceled(data: PaddleSubscriptionData, db: Database) {
  const subscription = data;
  const existing = await db.getSubscriptionByStripeId(subscription.id);

  if (existing) {
    await db.saveSubscription({
      id: existing.id,
      user_id: existing.user_id,
      stripe_subscription_id: subscription.id,
      stripe_customer_id: subscription.customer_id,
      status: 'canceled',
      plan: existing.plan,
      current_period_start: existing.current_period_start,
      current_period_end: existing.current_period_end,
      cancel_at_period_end: false,
    });

    // Send cancellation email
    try {
      const user = await db.getUserById(existing.user_id);
      if (user?.email) {
        const accessUntil = existing.current_period_end 
          ? new Date(existing.current_period_end * 1000).toISOString()
          : new Date().toISOString();
        
        await sendSubscriptionCanceledEmail(user.email, {
          plan: existing.plan.charAt(0).toUpperCase() + existing.plan.slice(1),
          accessUntil,
        });
      }
    } catch (emailError) {
      console.error('Error sending subscription canceled email:', emailError);
      // Don't fail webhook if email fails
    }
  }
}

async function handleTransactionCompleted(data: PaddleTransactionData, db: Database) {
  // Transaction completed - subscription should already be created
  // Just log for now
  console.log('Transaction completed:', data.id);
}

async function handleSubscriptionPastDue(data: PaddleSubscriptionData, db: Database) {
  const subscription = data;
  const existing = await db.getSubscriptionByStripeId(subscription.id);

  if (existing) {
    await db.saveSubscription({
      id: existing.id,
      user_id: existing.user_id,
      stripe_subscription_id: subscription.id,
      stripe_customer_id: subscription.customer_id,
      status: 'past_due',
      plan: existing.plan,
      current_period_start: existing.current_period_start,
      current_period_end: existing.current_period_end,
      cancel_at_period_end: existing.cancel_at_period_end === 1,
    });
    console.log('Subscription marked as past_due:', subscription.id);

    // Send email notification
    try {
      const user = await db.getUserById(existing.user_id);
      if (user?.email) {
        // Get amount from subscription plan (estimate based on plan type)
        const planAmounts: Record<string, string> = {
          monthly: '5.99',
          yearly: '59.99',
        };
        const amount = planAmounts[existing.plan] || '0';
        const currency = 'USD';
        
        await sendPaymentFailedEmail(user.email, {
          subscriptionId: subscription.id,
          amount,
          currency,
          nextRetryDate: subscription.next_billed_at || undefined,
        });
      }
    } catch (emailError) {
      console.error('Error sending payment failed email:', emailError);
      // Don't fail webhook if email fails
    }
  }
}

async function handleSubscriptionPaused(data: PaddleSubscriptionData, db: Database) {
  const subscription = data;
  const existing = await db.getSubscriptionByStripeId(subscription.id);

  if (existing) {
    // Paused subscriptions should still be marked as active but with a note
    // For now, we'll keep status as active but could add a paused flag later
    await db.saveSubscription({
      id: existing.id,
      user_id: existing.user_id,
      stripe_subscription_id: subscription.id,
      stripe_customer_id: subscription.customer_id,
      status: 'active', // Keep as active but access will be restricted
      plan: existing.plan,
      current_period_start: existing.current_period_start,
      current_period_end: existing.current_period_end,
      cancel_at_period_end: existing.cancel_at_period_end === 1,
    });
    console.log('Subscription paused:', subscription.id);
  }
}

async function handleTransactionRefunded(data: PaddleTransactionData, db: Database) {
  // Find subscription by transaction
  const subscriptionId = data.subscription_id;
  if (!subscriptionId) {
    console.log('Transaction refunded but no subscription ID:', data.id);
    return;
  }

  const existing = await db.getSubscriptionByStripeId(subscriptionId);
  if (existing) {
    // Update subscription status to canceled after refund
    await db.saveSubscription({
      id: existing.id,
      user_id: existing.user_id,
      stripe_subscription_id: existing.stripe_subscription_id,
      stripe_customer_id: existing.stripe_customer_id,
      status: 'canceled',
      plan: existing.plan,
      current_period_start: existing.current_period_start,
      current_period_end: existing.current_period_end,
      cancel_at_period_end: false,
    });
    console.log('Subscription canceled due to refund:', subscriptionId);
  } else {
    console.log('Subscription not found for refunded transaction:', subscriptionId);
  }
}

async function handleTransactionPaymentFailed(data: PaddleTransactionData, db: Database) {
  const subscriptionId = data.subscription_id;
  if (!subscriptionId) {
    console.log('Payment failed but no subscription ID:', data.id);
    return;
  }

  const existing = await db.getSubscriptionByStripeId(subscriptionId);
  if (existing) {
    // Mark subscription as past_due
    await db.saveSubscription({
      id: existing.id,
      user_id: existing.user_id,
      stripe_subscription_id: existing.stripe_subscription_id,
      stripe_customer_id: existing.stripe_customer_id,
      status: 'past_due',
      plan: existing.plan,
      current_period_start: existing.current_period_start,
      current_period_end: existing.current_period_end,
      cancel_at_period_end: existing.cancel_at_period_end === 1,
    });
    console.log('Subscription marked as past_due due to payment failure:', subscriptionId);

    // Send email notification
    try {
      const user = await db.getUserById(existing.user_id);
      if (user?.email) {
        const amount = data.totals?.total || data.total || '0';
        const currency = data.currency_code || 'USD';
        
        await sendPaymentFailedEmail(user.email, {
          subscriptionId: subscriptionId,
          amount: typeof amount === 'string' ? amount : amount.toString(),
          currency,
        });
      }
    } catch (emailError) {
      console.error('Error sending payment failed email:', emailError);
      // Don't fail webhook if email fails
    }
  }
}





