import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { createCheckoutSession } from '@/lib/paddle';

/**
 * POST /api/paddle/checkout
 * Create a Paddle checkout session for subscription
 * 
 * Body:
 * - plan: 'monthly' | 'yearly' | 'early_bird'
 */
export async function POST(request: NextRequest) {
  try {
    // Require authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { plan } = body;

    // Map plan to Paddle price ID (from environment variables)
    const priceIdMap: Record<string, string> = {
      monthly: process.env.PADDLE_PRICE_ID_MONTHLY || '',
      yearly: process.env.PADDLE_PRICE_ID_YEARLY || '',
      early_bird: process.env.PADDLE_PRICE_ID_EARLY_BIRD || process.env.PADDLE_PRICE_ID_MONTHLY || '',
    };

    const priceId = priceIdMap[plan];
    if (!priceId) {
      return NextResponse.json(
        { error: 'Invalid plan' },
        { status: 400 }
      );
    }

    // Create checkout session
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const userId = (session.user as any).id;
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID not found' },
        { status: 500 }
      );
    }
    const checkout = await createCheckoutSession(
      userId,
      priceId,
      `${baseUrl}/pricing/success`,
      `${baseUrl}/pricing`
    );

    if (!checkout) {
      return NextResponse.json(
        { error: 'Failed to create checkout session' },
        { status: 500 }
      );
    }

    return NextResponse.json({ checkout_url: checkout.url });
  } catch (error) {
    console.error('Error creating checkout:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}



