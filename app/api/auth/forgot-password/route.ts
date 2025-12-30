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

    console.log('User lookup result:', {
      email,
      userExists: !!user,
      userId: user?.id,
      hasPassword: !!user?.password,
      passwordLength: user?.password?.length || 0,
    });

    // Always return success to prevent email enumeration
    // But only send email if user exists and has a password (not OAuth-only)
    if (user && user.password) {
      console.log('✅ User found with password, proceeding with email send');
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
    } else {
      if (!user) {
        console.log('⚠️ User not found for email:', email);
        // Return clear message that email is not registered
        return NextResponse.json({
          error: 'No account found with this email address. Please check your email or sign up for a new account.',
        }, { status: 404 });
      } else if (!user.password) {
        console.log('⚠️ User exists but has no password (OAuth-only account):', email);
        console.log('User accounts:', user);
        // User exists but only has OAuth account
        return NextResponse.json({
          error: 'This email is associated with a Google account. Please use "Sign in with Google" instead.',
        }, { status: 400 });
      }
    }

    // User found with password - email was sent
    return NextResponse.json({
      message: 'A password reset link has been sent to your email. Please check your inbox and spam folder.',
    });
  } catch (error: any) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'An error occurred. Please try again later.' },
      { status: 500 }
    );
  }
}

