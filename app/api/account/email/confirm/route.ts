import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { rateLimit } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

/**
 * POST /api/account/email/confirm
 * Confirm email change using token from verification email
 */
export async function POST(request: NextRequest) {
  try {
    let body;
    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    const { token } = body;

    if (!token || typeof token !== 'string') {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

    // Rate limiting by token
    const identifier = `email-change-confirm:${token}`;
    if (!rateLimit(identifier, 5, 60000)) { // 5 requests per minute
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const db = getDb();
    
    // Get token from database
    const tokenData = await db.getEmailChangeToken(token);
    
    if (!tokenData) {
      return NextResponse.json(
        { error: 'Invalid or expired verification token' },
        { status: 400 }
      );
    }

    // Check if new email is already in use by another account
    const existingUser = await db.getUserByEmail(tokenData.newEmail);
    if (existingUser && existingUser.id !== tokenData.userId) {
      return NextResponse.json(
        { error: 'This email is already in use by another account' },
        { status: 400 }
      );
    }

    // Update user email
    await db.updateUser(tokenData.userId, { email: tokenData.newEmail });

    // Mark token as used
    await db.markEmailChangeTokenAsUsed(token);

    return NextResponse.json({
      success: true,
      message: 'Your email has been changed successfully. Please sign in again with your new email.',
    });
  } catch (error) {
    console.error('Error confirming email change:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

