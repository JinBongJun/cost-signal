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
      // Free tier: basic explanation (template-based) + locked indicators
      
      // Generate basic explanation for free tier (template-based, no AI)
      // Use overall_status to determine explanation (covers all cases including caution without risk)
      const riskCount = signal.risk_count;
      let basicExplanation = '';
      
      if (signal.overall_status === 'ok') {
        basicExplanation = 'This week\'s economic indicators show typical patterns with no unusual cost pressures affecting everyday expenses.';
      } else if (signal.overall_status === 'caution') {
        if (riskCount === 1) {
          basicExplanation = 'One economic indicator shows increased cost pressure this week, while others remain stable.';
        } else {
          // riskCount === 0 but cautionCount >= 1 (caution indicators without risk)
          basicExplanation = 'Some economic indicators show moderate changes this week, while others remain stable.';
        }
      } else {
        // overall_status === 'risk' (riskCount >= 2)
        basicExplanation = 'Multiple economic indicators show increased cost pressure this week, suggesting broader changes in everyday expenses.';
      }
      
      // Free tier: return locked indicators (show structure but hide status and values)
      const indicators = await db.getIndicatorsForWeek(signal.week_start);
      
      return NextResponse.json({
        week_start: signal.week_start,
        overall_status: signal.overall_status,
        risk_count: signal.risk_count,
        explanation: basicExplanation, // Basic template-based explanation
        explanation_type: 'basic', // Indicate this is a basic explanation
        // Return indicators as locked (no status, no values) - shows what they're missing
        indicators: indicators.map(ind => ({
          type: ind.indicator_type,
          locked: true, // Mark as locked for free tier
          // No status, no values - completely hidden to maintain value proposition
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

