import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { getDb } from '@/lib/db';
import { refundTransaction, getTransactions, getTransaction } from '@/lib/paddle';
import { sendRefundConfirmationEmail } from '@/lib/email';
import type { SessionUser } from '@/lib/types';

export const dynamic = 'force-dynamic';

/**
 * POST /api/refund
 * Request a refund for the user's subscription
 * 
 * Validates:
 * - User is authenticated
 * - User has an active subscription
 * - Purchase date is within 30 days
 * - Transaction exists and is refundable
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

    const userId = (session.user as SessionUser).id;
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
        { error: 'No active subscription found' },
        { status: 404 }
      );
    }

    if (!subscription.stripe_subscription_id) {
      return NextResponse.json(
        { error: 'Subscription ID not found' },
        { status: 400 }
      );
    }

    // Get the most recent transaction for this subscription
    const transactions = await getTransactions(subscription.stripe_subscription_id);
    if (!transactions || transactions.length === 0) {
      return NextResponse.json(
        { error: 'No transactions found for this subscription' },
        { status: 404 }
      );
    }

    // Find the most recent completed transaction
    const latestTransaction = transactions
      .filter((tx: any) => tx.status === 'completed' && !tx.refunded)
      .sort((a: any, b: any) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )[0];

    if (!latestTransaction) {
      return NextResponse.json(
        { error: 'No refundable transaction found' },
        { status: 404 }
      );
    }

    // Check if transaction is within 30 days
    const purchaseDate = new Date(latestTransaction.created_at);
    const now = new Date();
    const daysSincePurchase = Math.floor((now.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24));

    if (daysSincePurchase > 30) {
      return NextResponse.json(
        { 
          error: 'Refund request is outside the 30-day window',
          daysSincePurchase,
          purchaseDate: purchaseDate.toISOString(),
        },
        { status: 400 }
      );
    }

    // Check if transaction is already refunded
    if (latestTransaction.refunded) {
      return NextResponse.json(
        { error: 'This transaction has already been refunded' },
        { status: 400 }
      );
    }

    // Process refund
    const refundResult = await refundTransaction(
      latestTransaction.id,
      undefined, // Full refund
      'Customer requested refund within 30-day window'
    );

    if (!refundResult.success) {
      return NextResponse.json(
        { error: refundResult.error || 'Failed to process refund' },
        { status: 500 }
      );
    }

    // Update subscription status to canceled
    await db.saveSubscription({
      id: subscription.id,
      user_id: subscription.user_id,
      stripe_subscription_id: subscription.stripe_subscription_id,
      stripe_customer_id: subscription.stripe_customer_id,
      status: 'canceled',
      plan: subscription.plan,
      current_period_start: subscription.current_period_start,
      current_period_end: subscription.current_period_end,
      cancel_at_period_end: false,
    });

    // Send confirmation email
    if (session.user.email) {
      try {
        await sendRefundConfirmationEmail(session.user.email, {
          refundId: refundResult.refundId || latestTransaction.id,
          amount: latestTransaction.totals?.total || latestTransaction.total || '0',
          currency: latestTransaction.currency_code || 'USD',
          transactionDate: latestTransaction.created_at,
        });
      } catch (emailError) {
        console.error('Error sending refund confirmation email:', emailError);
        // Don't fail the refund if email fails
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Refund processed successfully',
      refundId: refundResult.refundId,
      daysSincePurchase,
    });
  } catch (error) {
    console.error('Error processing refund request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/refund
 * Check refund eligibility for the user's subscription
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = (session.user as SessionUser).id;
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID not found' },
        { status: 500 }
      );
    }

    const db = getDb();
    const subscription = await db.getSubscriptionByUserId(userId);

    if (!subscription) {
      return NextResponse.json({
        eligible: false,
        reason: 'No active subscription found',
      });
    }

    if (!subscription.stripe_subscription_id) {
      return NextResponse.json({
        eligible: false,
        reason: 'Subscription ID not found',
      });
    }

    // Get the most recent transaction
    const transactions = await getTransactions(subscription.stripe_subscription_id);
    if (!transactions || transactions.length === 0) {
      return NextResponse.json({
        eligible: false,
        reason: 'No transactions found',
      });
    }

    const latestTransaction = transactions
      .filter((tx: any) => tx.status === 'completed' && !tx.refunded)
      .sort((a: any, b: any) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )[0];

    if (!latestTransaction) {
      return NextResponse.json({
        eligible: false,
        reason: 'No refundable transaction found',
      });
    }

    // Check if within 30 days
    const purchaseDate = new Date(latestTransaction.created_at);
    const now = new Date();
    const daysSincePurchase = Math.floor((now.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24));
    const daysRemaining = 30 - daysSincePurchase;

    return NextResponse.json({
      eligible: daysSincePurchase <= 30,
      daysSincePurchase,
      daysRemaining: daysRemaining > 0 ? daysRemaining : 0,
      purchaseDate: purchaseDate.toISOString(),
      transactionId: latestTransaction.id,
      amount: latestTransaction.totals?.total || latestTransaction.total,
      currency: latestTransaction.currency_code || 'USD',
    });
  } catch (error) {
    console.error('Error checking refund eligibility:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

