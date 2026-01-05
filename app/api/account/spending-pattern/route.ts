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
    const { gas_frequency, monthly_rent, food_ratio, transport_mode, has_debt } = body;

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

    if (monthly_rent !== undefined && monthly_rent !== null && (typeof monthly_rent !== 'number' || monthly_rent < 0)) {
      return NextResponse.json(
        { error: 'Invalid monthly_rent' },
        { status: 400 }
      );
    }

    const db = getDb();
    await db.saveSpendingPattern(userId, {
      gas_frequency: gas_frequency || null,
      monthly_rent: monthly_rent !== undefined ? monthly_rent : null,
      food_ratio: food_ratio || null,
      transport_mode: transport_mode || null,
      has_debt: has_debt !== undefined ? has_debt : null,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving spending pattern:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

