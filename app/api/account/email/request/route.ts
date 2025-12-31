import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { getDb } from '@/lib/db';
import { sendEmailChangeEmail } from '@/lib/email';
import { v4 as uuidv4 } from 'uuid';
import { rateLimit } from '@/lib/rate-limit';
import type { SessionUser } from '@/lib/types';

export const dynamic = 'force-dynamic';

/**
 * POST /api/account/email/request
 * Request email change - sends verification email to new email address
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = (session.user as SessionUser).id;
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID not found' },
        { status: 500 }
      );
    }

    let body;
    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    const { newEmail } = body;

    if (!newEmail || typeof newEmail !== 'string') {
      return NextResponse.json(
        { error: 'New email is required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Rate limiting
    const identifier = `email-change:${userId}`;
    if (!rateLimit(identifier, 3, 60000)) { // 3 requests per minute
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const db = getDb();
    
    // Check if new email is already in use
    const existingUser = await db.getUserByEmail(newEmail);
    if (existingUser && existingUser.id !== userId) {
      return NextResponse.json(
        { error: 'This email is already in use by another account' },
        { status: 400 }
      );
    }

    // Check if new email is the same as current email
    const currentUser = await db.getUserById(userId);
    if (currentUser && currentUser.email.toLowerCase() === newEmail.toLowerCase()) {
      return NextResponse.json(
        { error: 'New email must be different from your current email' },
        { status: 400 }
      );
    }

    // Generate token
    const token = uuidv4();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour expiry

    // Save token to database
    await db.createEmailChangeToken(userId, newEmail.toLowerCase(), token, expiresAt);

    // Send email
    const emailResult = await sendEmailChangeEmail(newEmail.toLowerCase(), token);
    
    if (!emailResult.success) {
      console.error('Failed to send email change email:', emailResult.error);
      return NextResponse.json(
        { error: 'Failed to send verification email. Please try again later.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'A verification email has been sent to your new email address. Please check your inbox and click the confirmation link.',
    });
  } catch (error) {
    console.error('Error requesting email change:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

