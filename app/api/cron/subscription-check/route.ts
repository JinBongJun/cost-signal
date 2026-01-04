import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { sendPaymentFailedEmail } from '@/lib/email';
import { getSubscription } from '@/lib/paddle';

export const dynamic = 'force-dynamic';

/**
 * POST /api/cron/subscription-check
 * Check for past_due subscriptions and send reminders
 * This should be run daily to monitor subscription health
 */
export async function POST(request: NextRequest) {
  try {
    // Security: Verify request is from authorized source
    const isVercelCron = request.headers.get('x-vercel-signature') !== null;
    const cronSecret = request.headers.get('authorization')?.replace('Bearer ', '') || 
                       request.headers.get('x-cron-secret') || 
                       request.nextUrl.searchParams.get('secret');
    const expectedSecret = process.env.CRON_SECRET;
    const isDevelopment = process.env.NODE_ENV === 'development';

    if (!isVercelCron) {
      if (isDevelopment && !expectedSecret) {
        // Allow in development
      } else if (expectedSecret) {
        if (!cronSecret || cronSecret !== expectedSecret) {
          return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
          );
        }
      } else {
        return NextResponse.json(
          { error: 'Server configuration error' },
          { status: 500 }
        );
      }
    }

    const db = getDb();
    
    // Get all past_due subscriptions
    const { data: pastDueSubscriptions, error } = await (db as any).supabase
      .from('subscriptions')
      .select('*')
      .eq('status', 'past_due');

    if (error) {
      console.error('Error fetching past_due subscriptions:', error);
      return NextResponse.json(
        { error: 'Failed to fetch subscriptions' },
        { status: 500 }
      );
    }

    if (!pastDueSubscriptions || pastDueSubscriptions.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No past_due subscriptions found',
        checked: 0,
      });
    }

    let remindersSent = 0;
    let errors = 0;

    for (const subscription of pastDueSubscriptions) {
      try {
        // Get latest subscription status from Paddle
        if (subscription.stripe_subscription_id) {
          const paddleSubscription = await getSubscription(subscription.stripe_subscription_id);
          
          if (paddleSubscription) {
            // Update subscription status if it changed
            if (paddleSubscription.status !== subscription.status) {
              await db.saveSubscription({
                id: subscription.id,
                user_id: subscription.user_id,
                stripe_subscription_id: subscription.stripe_subscription_id,
                stripe_customer_id: subscription.stripe_customer_id,
                status: paddleSubscription.status === 'active' ? 'active' : subscription.status,
                plan: subscription.plan,
                current_period_start: subscription.current_period_start,
                current_period_end: subscription.current_period_end,
                cancel_at_period_end: subscription.cancel_at_period_end === 1,
              });
            }

            // If still past_due, send reminder
            if (paddleSubscription.status === 'past_due') {
              const user = await db.getUserById(subscription.user_id);
              if (user?.email) {
                const amount = paddleSubscription.items?.[0]?.price?.unit_amount 
                  ? (parseInt(paddleSubscription.items[0].price.unit_amount) / 100).toFixed(2)
                  : '0';
                const currency = paddleSubscription.items?.[0]?.price?.unit_amount?.currency_code || 'USD';
                
                await sendPaymentFailedEmail(user.email, {
                  subscriptionId: subscription.stripe_subscription_id,
                  amount,
                  currency,
                });
                remindersSent++;
              }
            }
          }
        }
      } catch (error) {
        console.error(`Error processing subscription ${subscription.id}:`, error);
        errors++;
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Subscription check completed',
      checked: pastDueSubscriptions.length,
      remindersSent,
      errors,
    });
  } catch (error) {
    console.error('Error in subscription check:', error);
    return NextResponse.json(
      { error: 'Check failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

