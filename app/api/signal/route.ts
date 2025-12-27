import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getCurrentUser, hasActiveSubscription } from '@/lib/auth';

/**
 * GET /api/signal
 * Returns the latest weekly signal
 * 
 * Query params:
 * - tier: 'free' | 'paid' (default: 'free')
 * 
 * Free tier: Returns only overall signal (no explanation, no indicators)
 * Paid tier: Returns overall signal + explanation + individual indicators (requires authentication and active subscription)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const requestedTier = searchParams.get('tier') || 'free';

    // Check authentication for paid tier
    let tier = 'free';
    if (requestedTier === 'paid') {
      const user = await getCurrentUser();
      if (user) {
        const userId = (user as any).id;
        if (!userId) {
          return NextResponse.json({ error: 'User ID not found' }, { status: 500 });
        }
        const hasSubscription = await hasActiveSubscription(userId);
        if (hasSubscription) {
          tier = 'paid';
        } else {
          // User is authenticated but doesn't have active subscription
          return NextResponse.json(
            { error: 'Active subscription required for paid tier' },
            { status: 403 }
          );
        }
      } else {
        // User is not authenticated
        return NextResponse.json(
          { error: 'Authentication required for paid tier' },
          { status: 401 }
        );
      }
    }

    const db = getDb();
    const signal = await db.getLatestWeeklySignal();

    if (!signal) {
      return NextResponse.json(
        { error: 'No signal data available yet' },
        { status: 404 }
      );
    }

    if (tier === 'paid') {
      // Paid tier: include individual indicators
      const indicators = await db.getIndicatorsForWeek(signal.week_start);
      
      return NextResponse.json({
        week_start: signal.week_start,
        overall_status: signal.overall_status,
        risk_count: signal.risk_count,
        explanation: signal.explanation,
        indicators: indicators.map(ind => ({
          type: ind.indicator_type,
          value: ind.value,
          previous_value: ind.previous_value,
          change_percent: ind.change_percent,
          status: ind.status,
        })),
      });
    } else {
      // Free tier: only overall signal (no explanation, no indicators)
      return NextResponse.json({
        week_start: signal.week_start,
        overall_status: signal.overall_status,
        risk_count: signal.risk_count,
        // explanation: null, // Free tier doesn't get explanation
        // indicators: [], // Free tier doesn't get indicators
      });
    }
  } catch (error) {
    console.error('Error fetching signal:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

