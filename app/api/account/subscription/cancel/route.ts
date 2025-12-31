import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { getDb } from '@/lib/db';
import { cancelSubscription } from '@/lib/paddle';

export const dynamic = 'force-dynamic';

/**
 * POST /api/account/subscription/cancel
 * Cancel user's subscription
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = (session.user as any).id;
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID not found' },
        { status: 500 }
      );
    }

    const db = getDb();
    const subscription = await db.getSubscriptionByUserId(userId);

    if (!subscription) {
      return NextResponse.json(
        { error: 'No subscription found' },
        { status: 404 }
      );
    }

    if (subscription.status !== 'active') {
      return NextResponse.json(
        { error: 'Subscription is not active' },
        { status: 400 }
      );
    }

    // Cancel subscription via Paddle API
    const paddleSubscriptionId = subscription.stripe_subscription_id; // Note: using stripe_subscription_id field for Paddle ID
    const canceled = await cancelSubscription(paddleSubscriptionId);

    if (!canceled) {
      return NextResponse.json(
        { error: 'Failed to cancel subscription with payment provider' },
        { status: 500 }
      );
    }

    // Update subscription in database (webhook will also update this, but update immediately for better UX)
    await db.saveSubscription({
      id: subscription.id,
      user_id: subscription.user_id,
      stripe_subscription_id: subscription.stripe_subscription_id,
      stripe_customer_id: subscription.stripe_customer_id,
      status: subscription.status,
      plan: subscription.plan,
      current_period_start: subscription.current_period_start,
      current_period_end: subscription.current_period_end,
      cancel_at_period_end: true, // Will be canceled at period end
    });

    return NextResponse.json({
      success: true,
      message: 'Subscription canceled successfully',
    });
  } catch (error) {
    console.error('Error canceling subscription:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


