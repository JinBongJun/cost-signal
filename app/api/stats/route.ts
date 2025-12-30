import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

/**
 * GET /api/stats
 * Get public statistics for the app
 */
export async function GET(request: NextRequest) {
  try {
    const db = getDb();
    
    // Get statistics from database
    const [
      { count: userCount },
      { count: subscriberCount },
      { count: signalCount },
    ] = await Promise.all([
      // Total users
      supabase
        .from('users')
        .select('*', { count: 'exact', head: true }),
      
      // Push notification subscribers
      supabase
        .from('push_subscriptions')
        .select('*', { count: 'exact', head: true }),
      
      // Total weekly signals (weeks of data)
      supabase
        .from('weekly_signals')
        .select('*', { count: 'exact', head: true }),
    ]);

    // Get the first signal date for "Since" date
    const { data: firstSignal } = await supabase
      .from('weekly_signals')
      .select('created_at')
      .order('created_at', { ascending: true })
      .limit(1)
      .single();

    const stats = {
      totalUsers: userCount || 0,
      notificationSubscribers: subscriberCount || 0,
      weeksOfData: signalCount || 0,
      sinceDate: firstSignal?.created_at || null,
    };

    return NextResponse.json({ stats });
  } catch (error) {
    console.error('Error fetching stats:', error);
    // Return default stats on error
    return NextResponse.json({
      stats: {
        totalUsers: 0,
        notificationSubscribers: 0,
        weeksOfData: 0,
        sinceDate: null,
      },
    });
  }
}

