import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendPasswordResetEmail(email: string, resetToken: string) {
  if (!process.env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY is not set');
    console.error('Available env vars:', Object.keys(process.env).filter(k => k.includes('RESEND')));
    return { success: false, error: 'Email service not configured' };
  }

  console.log('Attempting to send password reset email to:', email);
  console.log('RESEND_API_KEY exists:', !!process.env.RESEND_API_KEY);
  console.log('RESEND_API_KEY length:', process.env.RESEND_API_KEY?.length || 0);
  console.log('RESEND_FROM_EMAIL:', process.env.RESEND_FROM_EMAIL);
  
  // Validate API key format
  if (process.env.RESEND_API_KEY && !process.env.RESEND_API_KEY.startsWith('re_')) {
    console.error('⚠️ WARNING: RESEND_API_KEY does not start with "re_" - may be invalid');
  }

  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://cost-signal.vercel.app'}/reset-password?token=${resetToken}`;

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'Cost Signal <noreply@cost-signal.com>',
      to: email,
      subject: 'Reset Your Password - Cost Signal',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Cost Signal</h1>
            </div>
            <div style="background: #ffffff; padding: 40px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
              <h2 style="color: #1f2937; margin-top: 0;">Reset Your Password</h2>
              <p style="color: #4b5563;">You requested to reset your password for your Cost Signal account. Click the button below to create a new password:</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" style="display: inline-block; background: #667eea; color: white; text-decoration: none; padding: 14px 28px; border-radius: 6px; font-weight: 600; font-size: 16px;">Reset Password</a>
              </div>
              <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">Or copy and paste this link into your browser:</p>
              <p style="color: #667eea; font-size: 12px; word-break: break-all; background: #f3f4f6; padding: 10px; border-radius: 4px;">${resetUrl}</p>
              <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.</p>
            </div>
            <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;">
              <p>© ${new Date().getFullYear()} Cost Signal. All rights reserved.</p>
            </div>
          </body>
        </html>
      `,
      text: `Reset Your Password - Cost Signal

You requested to reset your password for your Cost Signal account. Click the link below to create a new password:

${resetUrl}

This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.

© ${new Date().getFullYear()} Cost Signal. All rights reserved.`,
    });

    if (error) {
      console.error('Resend error:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      return { success: false, error: error.message };
    }

    console.log('Email sent successfully via Resend. Email ID:', data?.id);
    return { success: true, data };
  } catch (error: any) {
    console.error('Email send error:', error);
    return { success: false, error: error.message || 'Failed to send email' };
  }
}

export async function sendFeedbackNotification(feedback: {
  type: 'bug' | 'feature' | 'general';
  subject: string;
  message: string;
  userEmail?: string;
}) {
  if (!process.env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY is not set');
    return { success: false, error: 'Email service not configured' };
  }

  const adminEmail = process.env.ADMIN_EMAIL || process.env.RESEND_FROM_EMAIL;
  if (!adminEmail) {
    console.warn('ADMIN_EMAIL not set, skipping feedback notification');
    return { success: false, error: 'Admin email not configured' };
  }

  const typeLabels: Record<string, string> = {
    bug: '🐛 Bug Report',
    feature: '💡 Feature Request',
    general: '📝 General Feedback',
  };

  const typeLabel = typeLabels[feedback.type] || feedback.type;

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'Cost Signal <noreply@cost-signal.com>',
      to: adminEmail,
      subject: `New Feedback: ${feedback.subject}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Cost Signal</h1>
            </div>
            <div style="background: #ffffff; padding: 40px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
              <h2 style="color: #1f2937; margin-top: 0;">New Feedback Received</h2>
              <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0 0 10px 0;"><strong>Type:</strong> ${typeLabel}</p>
                <p style="margin: 0 0 10px 0;"><strong>Subject:</strong> ${feedback.subject}</p>
                ${feedback.userEmail ? `<p style="margin: 0 0 10px 0;"><strong>From:</strong> ${feedback.userEmail}</p>` : '<p style="margin: 0 0 10px 0;"><strong>From:</strong> Anonymous</p>'}
                <p style="margin: 0;"><strong>Message:</strong></p>
                <div style="background: white; padding: 15px; border-radius: 4px; margin-top: 10px; white-space: pre-wrap; color: #4b5563;">${feedback.message}</div>
              </div>
              <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">This feedback has been saved to the database and is available in the admin panel.</p>
            </div>
            <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;">
              <p>© ${new Date().getFullYear()} Cost Signal. All rights reserved.</p>
            </div>
          </body>
        </html>
      `,
      text: `New Feedback Received - Cost Signal

Type: ${typeLabel}
Subject: ${feedback.subject}
${feedback.userEmail ? `From: ${feedback.userEmail}` : 'From: Anonymous'}

Message:
${feedback.message}

This feedback has been saved to the database and is available in the admin panel.

© ${new Date().getFullYear()} Cost Signal. All rights reserved.`,
    });

    if (error) {
      console.error('Resend error:', error);
      return { success: false, error: error.message };
    }

    console.log('Feedback notification email sent successfully. Email ID:', data?.id);
    return { success: true, data };
  } catch (error: any) {
    console.error('Email send error:', error);
    return { success: false, error: error.message || 'Failed to send email' };
  }
}

