import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * GET /api/account/spending-pattern
 * Get user's spending pattern
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = (user as any).id;
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID not found' },
        { status: 500 }
      );
    }

    const db = getDb();
    const pattern = await db.getSpendingPattern(userId);

    if (!pattern) {
      return NextResponse.json({ pattern: null });
    }

    return NextResponse.json({
      pattern: {
        gas_frequency: pattern.gas_frequency,
        monthly_rent: pattern.monthly_rent,
        food_ratio: pattern.food_ratio,
        transport_mode: pattern.transport_mode,
        has_debt: pattern.has_debt,
      },
    });
  } catch (error) {
    console.error('Error fetching spending pattern:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/account/spending-pattern
 * Save or update user's spending pattern
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = (user as any).id;
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID not found' },
        { status: 500 }
      );
    }

    const body = await request.json();
    console.log('Received request body:', body);
    
    let { gas_frequency, monthly_rent, food_ratio, transport_mode, has_debt } = body;

    // Convert monthly_rent to number if it's a string
    if (monthly_rent !== undefined && monthly_rent !== null && typeof monthly_rent === 'string') {
      const parsed = parseFloat(monthly_rent);
      if (!isNaN(parsed)) {
        monthly_rent = parsed;
      } else {
        return NextResponse.json(
          { error: 'Invalid monthly_rent: must be a number' },
          { status: 400 }
        );
      }
    }

    // Validate input
    if (gas_frequency && !['daily', 'weekly', 'biweekly', 'monthly'].includes(gas_frequency)) {
      return NextResponse.json(
        { error: 'Invalid gas_frequency' },
        { status: 400 }
      );
    }

    if (food_ratio && !['low', 'medium', 'high'].includes(food_ratio)) {
      return NextResponse.json(
        { error: 'Invalid food_ratio' },
        { status: 400 }
      );
    }

    if (transport_mode && !['car', 'public', 'mixed'].includes(transport_mode)) {
      return NextResponse.json(
        { error: 'Invalid transport_mode' },
        { status: 400 }
      );
    }

    if (monthly_rent !== undefined && monthly_rent !== null && (typeof monthly_rent !== 'number' || monthly_rent < 0 || isNaN(monthly_rent))) {
      return NextResponse.json(
        { error: 'Invalid monthly_rent: must be a positive number' },
        { status: 400 }
      );
    }

    console.log('Saving spending pattern:', {
      userId,
      pattern: {
        gas_frequency: gas_frequency || null,
        monthly_rent: monthly_rent !== undefined ? monthly_rent : null,
        food_ratio: food_ratio || null,
        transport_mode: transport_mode || null,
        has_debt: has_debt !== undefined ? has_debt : null,
      },
    });

    const db = getDb();
    await db.saveSpendingPattern(userId, {
      gas_frequency: gas_frequency || null,
      monthly_rent: monthly_rent !== undefined ? monthly_rent : null,
      food_ratio: food_ratio || null,
      transport_mode: transport_mode || null,
      has_debt: has_debt !== undefined ? has_debt : null,
    });

    console.log('Spending pattern saved successfully');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving spending pattern:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error details:', {
      message: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
    });
    // Always include error message for debugging (even in production for now)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: errorMessage,
        // Include more context for debugging
        errorType: error instanceof Error ? error.constructor.name : 'Unknown',
      },
      { status: 500 }
    );
  }
}

