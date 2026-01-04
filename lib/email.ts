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
  console.log('📧 Attempting to send feedback notification email...');
  console.log('📧 RESEND_API_KEY exists:', !!process.env.RESEND_API_KEY);
  console.log('📧 RESEND_API_KEY length:', process.env.RESEND_API_KEY?.length || 0);
  console.log('📧 ADMIN_EMAIL:', process.env.ADMIN_EMAIL || 'NOT SET');
  console.log('📧 RESEND_FROM_EMAIL:', process.env.RESEND_FROM_EMAIL || 'NOT SET');

  if (!process.env.RESEND_API_KEY) {
    console.error('❌ RESEND_API_KEY is not set - cannot send email');
    return { success: false, error: 'Email service not configured' };
  }

  // Validate API key format
  if (process.env.RESEND_API_KEY && !process.env.RESEND_API_KEY.startsWith('re_')) {
    console.error('⚠️ WARNING: RESEND_API_KEY does not start with "re_" - may be invalid');
  }

  const adminEmail = process.env.ADMIN_EMAIL || process.env.RESEND_FROM_EMAIL;
  if (!adminEmail) {
    console.error('❌ ADMIN_EMAIL and RESEND_FROM_EMAIL both not set - cannot send email');
    console.error('❌ Please set ADMIN_EMAIL environment variable');
    return { success: false, error: 'Admin email not configured' };
  }

  console.log('📧 Sending email to:', adminEmail);

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
      console.error('❌ Resend API error:', error);
      console.error('❌ Error details:', JSON.stringify(error, null, 2));
      console.error('❌ Error message:', error.message);
      console.error('❌ Error name:', error.name);
      return { success: false, error: error.message };
    }

    console.log('✅ Feedback notification email sent successfully!');
    console.log('✅ Email ID:', data?.id);
    console.log('✅ Sent to:', adminEmail);
    return { success: true, data };
  } catch (error: any) {
    console.error('❌ Email send exception:', error);
    console.error('❌ Error type:', error?.constructor?.name);
    console.error('❌ Error message:', error?.message);
    console.error('❌ Error stack:', error?.stack);
    return { success: false, error: error.message || 'Failed to send email' };
  }
}

export async function sendRefundConfirmationEmail(email: string, refundDetails: {
  refundId: string;
  amount: string;
  currency: string;
  transactionDate: string;
}) {
  if (!process.env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY is not set');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'Cost Signal <noreply@cost-signal.com>',
      to: email,
      subject: 'Refund Processed - Cost Signal',
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
              <h2 style="color: #1f2937; margin-top: 0;">Refund Processed</h2>
              <p style="color: #4b5563;">Your refund request has been processed successfully.</p>
              <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0 0 10px 0;"><strong>Refund ID:</strong> ${refundDetails.refundId}</p>
                <p style="margin: 0 0 10px 0;"><strong>Amount:</strong> ${refundDetails.currency === 'USD' ? '$' : ''}${refundDetails.amount}${refundDetails.currency !== 'USD' ? ` ${refundDetails.currency}` : ''}</p>
                <p style="margin: 0;"><strong>Original Transaction Date:</strong> ${new Date(refundDetails.transactionDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
              <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">The refund will appear in your account within 5-10 business days, depending on your payment method and financial institution.</p>
              <p style="color: #6b7280; font-size: 14px;">Your subscription has been canceled and you will no longer be charged.</p>
            </div>
            <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;">
              <p>© ${new Date().getFullYear()} Cost Signal. All rights reserved.</p>
            </div>
          </body>
        </html>
      `,
      text: `Refund Processed - Cost Signal

Your refund request has been processed successfully.

Refund ID: ${refundDetails.refundId}
Amount: ${refundDetails.currency === 'USD' ? '$' : ''}${refundDetails.amount}${refundDetails.currency !== 'USD' ? ` ${refundDetails.currency}` : ''}
Original Transaction Date: ${new Date(refundDetails.transactionDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}

The refund will appear in your account within 5-10 business days, depending on your payment method and financial institution.

Your subscription has been canceled and you will no longer be charged.

© ${new Date().getFullYear()} Cost Signal. All rights reserved.`,
    });

    if (error) {
      console.error('Error sending refund confirmation email:', error);
      return { success: false, error: error.message };
    }

    console.log('Refund confirmation email sent successfully. Email ID:', data?.id);
    return { success: true, data };
  } catch (error: any) {
    console.error('Error sending refund confirmation email:', error);
    return { success: false, error: error.message || 'Failed to send email' };
  }
}

export async function sendPaymentFailedEmail(email: string, subscriptionDetails: {
  subscriptionId: string;
  amount: string;
  currency: string;
  nextRetryDate?: string;
}) {
  if (!process.env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY is not set');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'Cost Signal <noreply@cost-signal.com>',
      to: email,
      subject: 'Payment Failed - Cost Signal',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Cost Signal</h1>
            </div>
            <div style="background: #ffffff; padding: 40px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
              <h2 style="color: #1f2937; margin-top: 0;">Payment Failed</h2>
              <p style="color: #4b5563;">We were unable to process your payment for your Cost Signal subscription.</p>
              <div style="background: #fef2f2; border: 1px solid #fecaca; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0 0 10px 0; color: #991b1b;"><strong>Amount:</strong> ${subscriptionDetails.currency === 'USD' ? '$' : ''}${subscriptionDetails.amount}${subscriptionDetails.currency !== 'USD' ? ` ${subscriptionDetails.currency}` : ''}</p>
                ${subscriptionDetails.nextRetryDate ? `<p style="margin: 0; color: #991b1b;"><strong>Next Retry:</strong> ${new Date(subscriptionDetails.nextRetryDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>` : ''}
              </div>
              <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">Please update your payment method in your account settings to continue your subscription. If payment is not updated, your subscription may be canceled.</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://cost-signal.com'}/account" style="display: inline-block; background: #667eea; color: white; text-decoration: none; padding: 14px 28px; border-radius: 6px; font-weight: 600; font-size: 16px;">Update Payment Method</a>
              </div>
            </div>
            <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;">
              <p>© ${new Date().getFullYear()} Cost Signal. All rights reserved.</p>
            </div>
          </body>
        </html>
      `,
      text: `Payment Failed - Cost Signal

We were unable to process your payment for your Cost Signal subscription.

Amount: ${subscriptionDetails.currency === 'USD' ? '$' : ''}${subscriptionDetails.amount}${subscriptionDetails.currency !== 'USD' ? ` ${subscriptionDetails.currency}` : ''}
${subscriptionDetails.nextRetryDate ? `Next Retry: ${new Date(subscriptionDetails.nextRetryDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}\n` : ''}
Please update your payment method in your account settings to continue your subscription. If payment is not updated, your subscription may be canceled.

Update Payment Method: ${process.env.NEXT_PUBLIC_APP_URL || 'https://cost-signal.com'}/account

© ${new Date().getFullYear()} Cost Signal. All rights reserved.`,
    });

    if (error) {
      console.error('Error sending payment failed email:', error);
      return { success: false, error: error.message };
    }

    console.log('Payment failed email sent successfully. Email ID:', data?.id);
    return { success: true, data };
  } catch (error: any) {
    console.error('Error sending payment failed email:', error);
    return { success: false, error: error.message || 'Failed to send email' };
  }
}

export async function sendSubscriptionCreatedEmail(email: string, subscriptionDetails: {
  plan: string;
  amount: string;
  currency: string;
  billingPeriod: string;
}) {
  if (!process.env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY is not set');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'Cost Signal <noreply@cost-signal.com>',
      to: email,
      subject: 'Welcome to Cost Signal Premium!',
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
              <h2 style="color: #1f2937; margin-top: 0;">Welcome to Premium!</h2>
              <p style="color: #4b5563;">Thank you for subscribing to Cost Signal Premium. Your subscription is now active.</p>
              <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0 0 10px 0;"><strong>Plan:</strong> ${subscriptionDetails.plan}</p>
                <p style="margin: 0 0 10px 0;"><strong>Amount:</strong> ${subscriptionDetails.currency === 'USD' ? '$' : ''}${subscriptionDetails.amount}${subscriptionDetails.currency !== 'USD' ? ` ${subscriptionDetails.currency}` : ''} per ${subscriptionDetails.billingPeriod}</p>
              </div>
              <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">You now have access to detailed indicator breakdowns and historical data. Enjoy your premium experience!</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://cost-signal.com'}" style="display: inline-block; background: #667eea; color: white; text-decoration: none; padding: 14px 28px; border-radius: 6px; font-weight: 600; font-size: 16px;">View Dashboard</a>
              </div>
            </div>
            <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;">
              <p>© ${new Date().getFullYear()} Cost Signal. All rights reserved.</p>
            </div>
          </body>
        </html>
      `,
      text: `Welcome to Premium! - Cost Signal

Thank you for subscribing to Cost Signal Premium. Your subscription is now active.

Plan: ${subscriptionDetails.plan}
Amount: ${subscriptionDetails.currency === 'USD' ? '$' : ''}${subscriptionDetails.amount}${subscriptionDetails.currency !== 'USD' ? ` ${subscriptionDetails.currency}` : ''} per ${subscriptionDetails.billingPeriod}

You now have access to detailed indicator breakdowns and historical data. Enjoy your premium experience!

View Dashboard: ${process.env.NEXT_PUBLIC_APP_URL || 'https://cost-signal.com'}

© ${new Date().getFullYear()} Cost Signal. All rights reserved.`,
    });

    if (error) {
      console.error('Error sending subscription created email:', error);
      return { success: false, error: error.message };
    }

    console.log('Subscription created email sent successfully. Email ID:', data?.id);
    return { success: true, data };
  } catch (error: any) {
    console.error('Error sending subscription created email:', error);
    return { success: false, error: error.message || 'Failed to send email' };
  }
}

export async function sendSubscriptionCanceledEmail(email: string, subscriptionDetails: {
  plan: string;
  accessUntil: string;
}) {
  if (!process.env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY is not set');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'Cost Signal <noreply@cost-signal.com>',
      to: email,
      subject: 'Subscription Canceled - Cost Signal',
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
              <h2 style="color: #1f2937; margin-top: 0;">Subscription Canceled</h2>
              <p style="color: #4b5563;">Your Cost Signal subscription has been canceled.</p>
              <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0 0 10px 0;"><strong>Plan:</strong> ${subscriptionDetails.plan}</p>
                <p style="margin: 0;"><strong>Access Until:</strong> ${new Date(subscriptionDetails.accessUntil).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
              <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">You will continue to have access to premium features until ${new Date(subscriptionDetails.accessUntil).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}. After that, you'll be moved to the free tier.</p>
              <p style="color: #6b7280; font-size: 14px;">We're sorry to see you go! If you change your mind, you can resubscribe anytime.</p>
            </div>
            <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;">
              <p>© ${new Date().getFullYear()} Cost Signal. All rights reserved.</p>
            </div>
          </body>
        </html>
      `,
      text: `Subscription Canceled - Cost Signal

Your Cost Signal subscription has been canceled.

Plan: ${subscriptionDetails.plan}
Access Until: ${new Date(subscriptionDetails.accessUntil).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}

You will continue to have access to premium features until ${new Date(subscriptionDetails.accessUntil).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}. After that, you'll be moved to the free tier.

We're sorry to see you go! If you change your mind, you can resubscribe anytime.

© ${new Date().getFullYear()} Cost Signal. All rights reserved.`,
    });

    if (error) {
      console.error('Error sending subscription canceled email:', error);
      return { success: false, error: error.message };
    }

    console.log('Subscription canceled email sent successfully. Email ID:', data?.id);
    return { success: true, data };
  } catch (error: any) {
    console.error('Error sending subscription canceled email:', error);
    return { success: false, error: error.message || 'Failed to send email' };
  }
}

export async function sendCronFailureAlert(errorDetails: {
  error: string;
  timestamp: string;
  stack?: string;
}) {
  if (!process.env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY is not set');
    return { success: false, error: 'Email service not configured' };
  }

  const adminEmail = process.env.ADMIN_EMAIL || process.env.RESEND_FROM_EMAIL;
  if (!adminEmail) {
    console.error('ADMIN_EMAIL not configured');
    return { success: false, error: 'Admin email not configured' };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'Cost Signal <noreply@cost-signal.com>',
      to: adminEmail,
      subject: '🚨 Cron Job Failed - Cost Signal',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Cost Signal</h1>
            </div>
            <div style="background: #ffffff; padding: 40px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
              <h2 style="color: #1f2937; margin-top: 0;">⚠️ Weekly Update Failed</h2>
              <p style="color: #4b5563;">The weekly data update cron job has failed.</p>
              <div style="background: #fef2f2; border: 1px solid #fecaca; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0 0 10px 0; color: #991b1b;"><strong>Error:</strong></p>
                <pre style="background: white; padding: 15px; border-radius: 4px; overflow-x: auto; color: #991b1b; font-size: 12px; margin: 0;">${errorDetails.error}</pre>
                ${errorDetails.stack ? `<pre style="background: white; padding: 15px; border-radius: 4px; overflow-x: auto; color: #991b1b; font-size: 11px; margin-top: 10px; margin-bottom: 0;">${errorDetails.stack}</pre>` : ''}
              </div>
              <p style="color: #6b7280; font-size: 14px; margin-top: 30px;"><strong>Timestamp:</strong> ${new Date(errorDetails.timestamp).toLocaleString('en-US', { timeZoneName: 'short' })}</p>
              <p style="color: #6b7280; font-size: 14px;">Please check the logs and fix the issue. The cron job will retry on the next scheduled run.</p>
            </div>
            <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;">
              <p>© ${new Date().getFullYear()} Cost Signal. All rights reserved.</p>
            </div>
          </body>
        </html>
      `,
      text: `Weekly Update Failed - Cost Signal

The weekly data update cron job has failed.

Error:
${errorDetails.error}

${errorDetails.stack ? `Stack Trace:\n${errorDetails.stack}\n` : ''}
Timestamp: ${new Date(errorDetails.timestamp).toLocaleString('en-US', { timeZoneName: 'short' })}

Please check the logs and fix the issue. The cron job will retry on the next scheduled run.

© ${new Date().getFullYear()} Cost Signal. All rights reserved.`,
    });

    if (error) {
      console.error('Error sending cron failure alert:', error);
      return { success: false, error: error.message };
    }

    console.log('Cron failure alert sent successfully. Email ID:', data?.id);
    return { success: true, data };
  } catch (error: any) {
    console.error('Error sending cron failure alert:', error);
    return { success: false, error: error.message || 'Failed to send email' };
  }
}

export async function sendEmailChangeEmail(newEmail: string, token: string) {
  if (!process.env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY is not set');
    return { success: false, error: 'Email service not configured' };
  }

  const confirmUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://cost-signal.vercel.app'}/account/email/confirm?token=${token}`;

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'Cost Signal <noreply@cost-signal.com>',
      to: newEmail,
      subject: 'Confirm Your New Email - Cost Signal',
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
              <h2 style="color: #1f2937; margin-top: 0;">Confirm Your New Email</h2>
              <p style="color: #4b5563;">You requested to change your email address to <strong>${newEmail}</strong>. Click the button below to confirm this change:</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${confirmUrl}" style="display: inline-block; background: #667eea; color: white; text-decoration: none; padding: 14px 28px; border-radius: 6px; font-weight: 600; font-size: 16px;">Confirm Email Change</a>
              </div>
              <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">Or copy and paste this link into your browser:</p>
              <p style="color: #667eea; font-size: 12px; word-break: break-all; background: #f3f4f6; padding: 10px; border-radius: 4px;">${confirmUrl}</p>
              <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">This link will expire in 1 hour. If you didn't request this change, you can safely ignore this email.</p>
            </div>
            <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;">
              <p>© ${new Date().getFullYear()} Cost Signal. All rights reserved.</p>
            </div>
          </body>
        </html>
      `,
      text: `Confirm Your New Email - Cost Signal

You requested to change your email address to ${newEmail}. Click the link below to confirm this change:

${confirmUrl}

This link will expire in 1 hour. If you didn't request this change, you can safely ignore this email.

© ${new Date().getFullYear()} Cost Signal. All rights reserved.`,
    });

    if (error) {
      const errorAny = error as any;
      console.error('❌ Resend API error:', error);
      console.error('❌ Error details:', JSON.stringify(error, null, 2));
      console.error('❌ Error message:', errorAny.message);
      console.error('❌ Error name:', errorAny.name);
      console.error('❌ Error statusCode:', errorAny.statusCode);
      console.error('❌ Attempted to send to:', newEmail);
      console.error('❌ RESEND_FROM_EMAIL:', process.env.RESEND_FROM_EMAIL);
      
      // Check for specific Resend errors
      if (errorAny.message?.includes('domain') || errorAny.message?.includes('Domain') || errorAny.message?.includes('verify a domain')) {
        // Domain might be verified but error message is generic - check statusCode
        if (errorAny.statusCode === 403) {
          return { 
            success: false, 
            error: 'Email sending failed. Please check that the domain is verified in Resend and try again.' 
          };
        }
        return { 
          success: false, 
          error: 'Email domain not verified. Please ensure the domain is verified in Resend.' 
        };
      }
      
      if (errorAny.message?.includes('testing') || errorAny.message?.includes('test') || errorAny.message?.includes('only send testing emails')) {
        return { 
          success: false, 
          error: 'This email address cannot receive emails from the test domain. Please verify your domain in Resend.' 
        };
      }
      
      if (errorAny.statusCode === 403) {
        return { 
          success: false, 
          error: 'Email sending failed. Please verify your domain is properly configured in Resend.' 
        };
      }
      
      // Return the actual error message from Resend
      return { success: false, error: errorAny.message || 'Failed to send email' };
    }

    console.log('✅ Email change confirmation email sent successfully. Email ID:', data?.id);
    console.log('✅ Sent to:', newEmail);
    return { success: true, data };
  } catch (error: any) {
    console.error('❌ Email send exception:', error);
    console.error('❌ Error type:', error?.constructor?.name);
    console.error('❌ Error message:', error?.message);
    console.error('❌ Error stack:', error?.stack);
    return { success: false, error: error.message || 'Failed to send email' };
  }
}

