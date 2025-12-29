import { NextRequest, NextResponse } from 'next/server';
import { runWeeklyUpdate } from '@/scripts/run-cron';
import { rateLimit } from '@/lib/rate-limit';

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
    // Rate limiting (except for Vercel Cron)
    const isVercelCron = request.headers.get('x-vercel-signature') !== null;
    if (!isVercelCron) {
      const ip = request.headers.get('x-forwarded-for') || 
                 request.headers.get('x-real-ip') || 
                 'unknown';
      const identifier = `cron:${ip}`;
      
      if (!rateLimit(identifier, 5, 60000)) { // 5 requests per minute
        return NextResponse.json(
          { error: 'Too many requests. Please try again later.' },
          { status: 429 }
        );
      }
    }

    // Security: Verify request is from authorized source
    // Vercel Cron automatically sends x-vercel-signature header
    // For manual calls, require CRON_SECRET
    const cronSecret = request.headers.get('authorization')?.replace('Bearer ', '');
    const expectedSecret = process.env.CRON_SECRET;

    // Allow if:
    // 1. From Vercel Cron (has x-vercel-signature header)
    // 2. Has valid CRON_SECRET (for manual calls)
    // 3. Development mode without secret (for testing)
    if (!isVercelCron && expectedSecret) {
      if (!cronSecret || cronSecret !== expectedSecret) {
        console.warn('Unauthorized cron attempt:', {
          hasSecret: !!cronSecret,
          hasExpectedSecret: !!expectedSecret,
          isVercelCron,
        });
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
    }

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

