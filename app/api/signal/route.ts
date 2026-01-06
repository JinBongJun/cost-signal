import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getCurrentUser, hasActiveSubscription } from '@/lib/auth';
import { calculateWeeklyImpact, calculateAverageImpact } from '@/lib/impact-calculator';
import { generatePersonalizedExplanation } from '@/lib/explainer';
import { generateActionableInsights, generatePredictions, generateSavingsOpportunities } from '@/lib/insights-generator';

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

    // Check if user is admin for frontend (needed for both free and paid tiers)
    let userIsAdmin = false;
    const user = await getCurrentUser();
    if (user) {
      const userId = (user as any).id;
      if (userId) {
        const { isAdmin } = await import('@/lib/auth');
        userIsAdmin = await isAdmin(userId);
        
        console.log('Signal API - Admin check:', {
          userId,
          userEmail: (user as any).email,
          userIsAdmin,
          ADMIN_EMAILS: process.env.ADMIN_EMAILS || 'NOT SET'
        });
      }
    }

    // Check authentication for paid tier
    let tier = 'free';
    if (requestedTier === 'paid') {
      // Preview mode: allow access without subscription for testing
      if (preview) {
        tier = 'paid';
      } else {
        if (user) {
          const userId = (user as any).id;
          if (!userId) {
            return NextResponse.json({ error: 'User ID not found' }, { status: 500 });
          }
          
          if (userIsAdmin) {
            console.log('✅ Admin access granted to paid tier');
            tier = 'paid';
          } else {
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
    
    // Check if a specific week_start is requested
    const weekStart = searchParams.get('week_start');
    let signal;
    
    if (weekStart) {
      // Get signal for specific week
      signal = await db.getWeeklySignal(weekStart);
      if (!signal) {
        return NextResponse.json(
          { error: 'Signal not found for the specified week' },
          { status: 404 }
        );
      }
    } else {
      // Get latest signal
      signal = await db.getLatestWeeklySignal();
      if (!signal) {
        console.error('No signal found in database');
        return NextResponse.json(
          { error: 'No signal data available yet' },
          { status: 404 }
        );
      }
    }


    if (tier === 'paid') {
      // Paid tier: include individual indicators + personalized impact analysis
      const indicators = await db.getIndicatorsForWeek(signal.week_start);
      
      // Get user's spending pattern for personalized impact calculation and explanation
      let impactAnalysis = null;
      let personalizedExplanation = signal.explanation;
      
      if (user) {
        const userId = (user as any).id;
        if (userId) {
          const spendingPattern = await db.getSpendingPattern(userId);
          console.log('Signal API - Spending pattern:', spendingPattern);
          if (spendingPattern) {
            const userPattern = {
              gas_frequency: spendingPattern.gas_frequency,
              monthly_rent: spendingPattern.monthly_rent,
              food_ratio: spendingPattern.food_ratio,
              transport_mode: spendingPattern.transport_mode,
              has_debt: spendingPattern.has_debt,
            };
            
            const impact = calculateWeeklyImpact(indicators, userPattern);
            const averageImpact = calculateAverageImpact(indicators);
            
            // Generate actionable insights, predictions, and savings opportunities
            const insights = generateActionableInsights(indicators, userPattern, impact);
            const predictions = generatePredictions(indicators);
            const savingsOpportunities = generateSavingsOpportunities(userPattern, impact);
            
            impactAnalysis = {
              totalWeeklyChange: impact.totalWeeklyChange,
              breakdown: impact.breakdown,
              spendingPattern: userPattern,
              averageImpact: {
                totalWeeklyChange: averageImpact.totalWeeklyChange,
                breakdown: averageImpact.breakdown,
              },
              insights,
              predictions,
              savingsOpportunities,
            };
            
            console.log('Signal API - Impact analysis created:', {
              totalWeeklyChange: impactAnalysis.totalWeeklyChange,
              breakdownCount: impactAnalysis.breakdown.length,
              hasSpendingPattern: !!impactAnalysis.spendingPattern,
              hasAverageImpact: !!impactAnalysis.averageImpact,
              insightsCount: insights.length,
              predictionsCount: predictions.length,
              savingsOpportunitiesCount: savingsOpportunities.length,
            });
            
            // Generate personalized explanation
            personalizedExplanation = await generatePersonalizedExplanation(
              signal,
              indicators,
              userPattern,
              impact
            );
          }
        }
      }
      
      return NextResponse.json({
        week_start: signal.week_start,
        overall_status: signal.overall_status,
        risk_count: signal.risk_count,
        explanation: personalizedExplanation,
        explanation_type: 'detailed',
        isAdmin: userIsAdmin, // Include admin status for frontend
        indicators: indicators.map(ind => ({
          type: ind.indicator_type,
          value: ind.value,
          previous_value: ind.previous_value,
          change_percent: ind.change_percent,
          status: ind.status,
        })),
        impactAnalysis, // Personalized impact analysis
      });
    } else {
      // Free tier: basic explanation (template-based) + locked indicators
      
      // Get indicators first to calculate cautionCount
      const indicators = await db.getIndicatorsForWeek(signal.week_start);
      
      // Generate basic explanation for free tier (template-based, no AI)
      // Use overall_status to determine explanation (covers all cases including caution without risk)
      const riskCount = signal.risk_count;
      const cautionCount = indicators.filter(ind => ind.status === 'caution').length;
      let basicExplanation = '';
      
      if (signal.overall_status === 'ok') {
        basicExplanation = 'This week\'s economic indicators show typical patterns with no unusual cost pressures affecting everyday expenses.';
      } else if (signal.overall_status === 'caution') {
        if (riskCount === 1) {
          // One risk indicator → caution
          basicExplanation = 'One economic indicator shows increased cost pressure this week, while others remain stable.';
        } else if (cautionCount === 1) {
          // One caution indicator (no risk) → caution
          basicExplanation = 'One economic indicator shows moderate changes this week, while others remain stable.';
        } else {
          // Multiple caution indicators (no risk) → caution
          basicExplanation = 'Some economic indicators show moderate changes this week, while others remain stable.';
        }
      } else {
        // overall_status === 'risk' (riskCount >= 2)
        basicExplanation = 'Multiple economic indicators show increased cost pressure this week, suggesting broader changes in everyday expenses.';
      }
      
      return NextResponse.json({
        week_start: signal.week_start,
        overall_status: signal.overall_status,
        risk_count: signal.risk_count,
        explanation: basicExplanation, // Basic template-based explanation
        explanation_type: 'basic', // Indicate this is a basic explanation
        isAdmin: userIsAdmin, // Include admin status for frontend
        // Return indicators with direction only (no values, no percentages) for free tier
        indicators: indicators.map(ind => {
          // Calculate direction from change_percent
          let direction: 'up' | 'down' | 'neutral' = 'neutral';
          if (ind.change_percent !== null && ind.change_percent !== undefined) {
            if (ind.change_percent > 0) {
              direction = 'up';
            } else if (ind.change_percent < 0) {
              direction = 'down';
            }
          }
          
          return {
            type: ind.indicator_type,
            locked: true, // Mark as locked for free tier
            direction, // Only direction, no values
            // No status, no values, no change_percent - completely hidden to maintain value proposition
          };
        }),
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

