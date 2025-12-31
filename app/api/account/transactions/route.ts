import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { getDb } from '@/lib/db';
import { getTransactions } from '@/lib/paddle';

export const dynamic = 'force-dynamic';

/**
 * GET /api/account/transactions
 * Get payment transactions for user's subscription
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

    const userId = (session.user as any).id;
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID not found' },
        { status: 500 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const subscriptionId = searchParams.get('subscription_id');

    if (!subscriptionId) {
      return NextResponse.json(
        { error: 'Subscription ID required' },
        { status: 400 }
      );
    }

    // Verify subscription belongs to user
    const db = getDb();
    const subscription = await db.getSubscriptionByUserId(userId);
    
    if (!subscription || subscription.stripe_subscription_id !== subscriptionId) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      );
    }

    // Fetch transactions from Paddle
    const transactions = await getTransactions(subscriptionId);

    return NextResponse.json({
      transactions: transactions.map((tx: any) => ({
        id: tx.id,
        status: tx.status,
        total: tx.totals?.total || tx.total || '0',
        currency_code: tx.currency_code || 'USD',
        created_at: tx.created_at,
        billing_period: tx.billing_period,
      })),
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


