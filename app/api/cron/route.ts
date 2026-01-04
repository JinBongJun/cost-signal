import { NextRequest, NextResponse } from 'next/server';
import { runWeeklyUpdate } from '@/scripts/run-cron';
import { rateLimit } from '@/lib/rate-limit';
import { sendCronFailureAlert } from '@/lib/email';

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
    // Security: Verify request is from authorized source
    const isVercelCron = request.headers.get('x-vercel-signature') !== null;
    const cronSecret = request.headers.get('authorization')?.replace('Bearer ', '') || 
                       request.headers.get('x-cron-secret') || 
                       request.nextUrl.searchParams.get('secret');
    const expectedSecret = process.env.CRON_SECRET;
    const isDevelopment = process.env.NODE_ENV === 'development';

    // Security check: Allow only if:
    // 1. From Vercel Cron (has x-vercel-signature header) - most secure
    // 2. Has valid CRON_SECRET (for manual/external calls)
    // 3. Development mode (for local testing only)
    if (!isVercelCron) {
      if (isDevelopment && !expectedSecret) {
        // Development mode without secret - allow for local testing
        console.log('⚠️ Development mode: Allowing cron without authentication');
      } else if (expectedSecret) {
        // Production or development with secret - require authentication
        if (!cronSecret || cronSecret !== expectedSecret) {
          console.warn('❌ Unauthorized cron attempt:', {
            hasSecret: !!cronSecret,
            hasExpectedSecret: !!expectedSecret,
            isVercelCron,
            isDevelopment,
            ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
          });
          return NextResponse.json(
            { error: 'Unauthorized. Valid CRON_SECRET required.' },
            { status: 401 }
          );
        }
      } else {
        // Production mode without secret configured - deny
        console.error('❌ CRON_SECRET not configured in production');
        return NextResponse.json(
          { error: 'Server configuration error' },
          { status: 500 }
        );
      }

      // Rate limiting for non-Vercel Cron requests
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

    await runWeeklyUpdate();

    return NextResponse.json({ success: true, message: 'Weekly update completed' });
  } catch (error) {
    console.error('Error in cron endpoint:', error);
    
    // Send alert email to admin
    try {
      await sendCronFailureAlert({
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
        stack: error instanceof Error ? error.stack : undefined,
      });
    } catch (emailError) {
      console.error('Failed to send cron failure alert:', emailError);
      // Don't fail the response if email fails
    }
    
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

