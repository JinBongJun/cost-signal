import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { verifyWebhookSignature } from '@/lib/paddle';
import type { PaddleWebhookEvent, PaddleSubscriptionData, PaddleTransactionData, Database } from '@/lib/types';

/**
 * POST /api/paddle/webhook
 * Handle Paddle webhook events
 * 
 * Events:
 * - subscription.created
 * - subscription.updated
 * - subscription.canceled
 * - transaction.completed
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

      case 'transaction.completed':
        await handleTransactionCompleted(event.data, db);
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
  }
}

async function handleTransactionCompleted(data: PaddleTransactionData, db: Database) {
  // Transaction completed - subscription should already be created
  // Just log for now
  console.log('Transaction completed:', data.id);
}





