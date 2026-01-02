import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { createCheckoutSession } from '@/lib/paddle';
import type { SessionUser } from '@/lib/types';

/**
 * POST /api/paddle/checkout
 * Create a Paddle checkout session for subscription
 * 
 * Body:
 * - plan: 'monthly' | 'yearly'
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

    let body: { plan?: string };
    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    const { plan } = body;

    if (!plan || typeof plan !== 'string') {
      return NextResponse.json(
        { error: 'Plan is required' },
        { status: 400 }
      );
    }

    // Map plan to Paddle price ID (from environment variables)
    const priceIdMap: Record<string, string> = {
      monthly: process.env.PADDLE_PRICE_ID_MONTHLY || '',
      yearly: process.env.PADDLE_PRICE_ID_YEARLY || '',
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
    const userId = (session.user as SessionUser).id;
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



