# Resend Email Setup Guide

This guide explains how to set up Resend for password reset emails.

## 1. Create a Resend Account

1. Go to https://resend.com
2. Sign up for a free account
3. Verify your email address

## 2. Get Your API Key

1. Go to https://resend.com/api-keys
2. Click "Create API Key"
3. Name it (e.g., "Cost Signal Production")
4. Copy the API key (you'll only see it once!)

## 3. Verify Your Domain (Optional but Recommended)

For production, you should verify your domain:

1. Go to https://resend.com/domains
2. Click "Add Domain"
3. Follow the DNS setup instructions
4. Once verified, you can use emails like `noreply@yourdomain.com`

## 4. Set Up Environment Variables

Add these to your `.env` file:

```env
RESEND_API_KEY=re_xxxxxxxxxxxxx
RESEND_FROM_EMAIL=Cost Signal <noreply@cost-signal.com>
```

For development/testing, you can use Resend's test domain:
```env
RESEND_FROM_EMAIL=Cost Signal <onboarding@resend.dev>
```

## 5. Add to Vercel

1. Go to your Vercel project settings
2. Navigate to "Environment Variables"
3. Add:
   - `RESEND_API_KEY`: Your Resend API key
   - `RESEND_FROM_EMAIL`: Your verified email address

## 6. Test the Setup

1. Go to `/forgot-password`
2. Enter a valid email address
3. Check your email (and spam folder)
4. Click the reset link
5. Set a new password

## Free Tier Limits

Resend's free tier includes:
- 3,000 emails/month
- 100 emails/day
- Perfect for small to medium applications

## Troubleshooting

- **Emails not sending**: Check that `RESEND_API_KEY` is set correctly
- **Emails going to spam**: Verify your domain and set up SPF/DKIM records
- **Rate limiting**: Check Resend dashboard for usage limits

