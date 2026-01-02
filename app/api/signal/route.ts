import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getCurrentUser, hasActiveSubscription } from '@/lib/auth';

export const dynamic = 'force-dynamic';

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
    const preview = searchParams.get('preview') === 'true'; // Preview mode for testing

    // Check authentication for paid tier
    let tier = 'free';
    if (requestedTier === 'paid') {
      // Preview mode: allow access without subscription for testing
      if (preview) {
        tier = 'paid';
      } else {
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
    }

    const db = getDb();
    const signal = await db.getLatestWeeklySignal();

    if (!signal) {
      console.error('No signal found in database');
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
      // Free tier: basic explanation (template-based) + locked indicators preview
      const indicators = await db.getIndicatorsForWeek(signal.week_start);
      
      // Generate basic explanation for free tier (template-based, no AI)
      const riskCount = signal.risk_count;
      let basicExplanation = '';
      if (riskCount === 0) {
        basicExplanation = 'This week\'s economic indicators show typical patterns with no unusual cost pressures affecting everyday expenses.';
      } else if (riskCount === 1) {
        basicExplanation = 'One economic indicator shows increased cost pressure this week, while others remain stable.';
      } else {
        basicExplanation = 'Multiple economic indicators show increased cost pressure this week, suggesting broader changes in everyday expenses.';
      }
      
      // Return indicators as "locked" for free tier (show structure but not values)
      return NextResponse.json({
        week_start: signal.week_start,
        overall_status: signal.overall_status,
        risk_count: signal.risk_count,
        explanation: basicExplanation, // Basic template-based explanation
        explanation_type: 'basic', // Indicate this is a basic explanation
        indicators: indicators.map(ind => ({
          type: ind.indicator_type,
          locked: true, // Mark as locked for free tier
          status: ind.status, // Show status but not values
        })),
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

