import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { sendPasswordResetEmail } from '@/lib/email';
import { v4 as uuidv4 } from 'uuid';
import { rateLimit } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Rate limiting
    const identifier = `forgot-password:${email}`;
    if (!rateLimit(identifier, 3, 60000)) { // 3 requests per minute
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const db = getDb();
    const user = await db.getUserByEmail(email);

    // Always return success to prevent email enumeration
    // But only send email if user exists and has a password (not OAuth-only)
    if (user && user.password) {
      // Generate reset token
      const token = uuidv4();
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour expiry

      // Save token to database
      await db.createPasswordResetToken(user.id, token, expiresAt);

      // Send email
      console.log('About to send password reset email to:', email);
      const emailResult = await sendPasswordResetEmail(email, token);
      
      if (!emailResult.success) {
        console.error('❌ Failed to send password reset email:', emailResult.error);
        console.error('Email:', email, 'Token:', token);
        console.error('RESEND_API_KEY exists:', !!process.env.RESEND_API_KEY);
        console.error('RESEND_FROM_EMAIL:', process.env.RESEND_FROM_EMAIL);
        // Still return success to user to prevent enumeration
      } else {
        console.log('✅ Password reset email sent successfully to:', email);
        console.log('Email ID:', emailResult.data?.id);
      }
    }

    // Always return success message
    return NextResponse.json({
      message: 'If an account with that email exists, a password reset link has been sent.',
    });
  } catch (error: any) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'An error occurred. Please try again later.' },
      { status: 500 }
    );
  }
}

