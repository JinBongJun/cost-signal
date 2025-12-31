import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { getDb } from '@/lib/db';
import { rateLimit } from '@/lib/rate-limit';
import { sendFeedbackNotification } from '@/lib/email';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Rate limiting (5 requests per hour per IP)
    const identifier = session?.user?.email || request.ip || 'anonymous';
    if (!rateLimit(`feedback:${identifier}`, 5, 3600000)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { type, subject, message, userEmail } = body;

    // Validation
    if (!type || !['bug', 'feature', 'general'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid feedback type' },
        { status: 400 }
      );
    }

    if (!subject || typeof subject !== 'string' || subject.trim().length < 3 || subject.trim().length > 200) {
      return NextResponse.json(
        { error: 'Subject must be between 3 and 200 characters' },
        { status: 400 }
      );
    }

    if (!message || typeof message !== 'string' || message.trim().length < 10 || message.trim().length > 2000) {
      return NextResponse.json(
        { error: 'Message must be between 10 and 2000 characters' },
        { status: 400 }
      );
    }

    const db = getDb();
    const feedbackData = {
      type,
      subject: subject.trim(),
      message: message.trim(),
      userEmail: session?.user?.email || userEmail || undefined,
    };

    // Save feedback to database
    await db.createFeedback(feedbackData);
    console.log('✅ Feedback saved to database');

    // Send notification email to admin (non-blocking)
    console.log('📧 Attempting to send feedback notification email...');
    sendFeedbackNotification(feedbackData)
      .then((result) => {
        if (result.success) {
          console.log('✅ Feedback notification email sent successfully');
        } else {
          console.error('❌ Failed to send feedback notification email:', result.error);
        }
      })
      .catch((error) => {
        console.error('❌ Exception while sending feedback notification email:', error);
        console.error('❌ Error details:', JSON.stringify(error, null, 2));
        // Don't fail the request if email fails
      });

    return NextResponse.json({
      success: true,
      message: 'Feedback submitted successfully',
    });
  } catch (error: any) {
    console.error('Feedback submission error:', error);
    return NextResponse.json(
      { error: 'An error occurred while submitting feedback. Please try again later.' },
      { status: 500 }
    );
  }
}

