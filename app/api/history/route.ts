import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { requirePaidTier } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * GET /api/history
 * Returns historical weekly signals (Paid tier only)
 * 
 * Query params:
 * - limit: number of weeks to return (default: 12)
 * 
 * Requires: Authentication and active subscription
 */
export async function GET(request: NextRequest) {
  try {
    // Require paid tier (includes auth check)
    await requirePaidTier();
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '12', 10);

    const db = getDb();
    const signals = await db.getWeeklySignalsHistory(limit);

    // Include indicators for each week
    const signalsWithIndicators = await Promise.all(
      signals.map(async (signal) => {
        const indicators = await db.getIndicatorsForWeek(signal.week_start);
        return {
          ...signal,
          indicators: indicators.map(ind => ({
            type: ind.indicator_type,
            value: ind.value,
            previous_value: ind.previous_value,
            change_percent: ind.change_percent,
            status: ind.status,
          })),
        };
      })
    );

    return NextResponse.json({
      signals: signalsWithIndicators,
      count: signalsWithIndicators.length,
    });
  } catch (error) {
    console.error('Error fetching history:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

