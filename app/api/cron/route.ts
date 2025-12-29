import { NextRequest, NextResponse } from 'next/server';
import { runWeeklyUpdate } from '@/scripts/run-cron';

export const dynamic = 'force-dynamic';

/**
 * Handler for /api/cron
 * Manually trigger weekly update (protected endpoint)
 * 
 * Supports both GET (for Vercel dashboard "Run" button) and POST (for scheduled cron)
 * In production, this should be protected with authentication
 * or called only by your cron service (e.g., Vercel Cron, external scheduler)
 */
async function handleCron(request: NextRequest) {
  try {
    // Optional: Add authentication check here
    // const authHeader = request.headers.get('authorization');
    // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    await runWeeklyUpdate();

    return NextResponse.json({ success: true, message: 'Weekly update completed' });
  } catch (error) {
    console.error('Error in cron endpoint:', error);
    return NextResponse.json(
      { error: 'Update failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Support GET for Vercel dashboard "Run" button
export async function GET(request: NextRequest) {
  return handleCron(request);
}

// Support POST for scheduled cron jobs
export async function POST(request: NextRequest) {
  return handleCron(request);
}

