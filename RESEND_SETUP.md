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

## 3. Verify Your Domain (REQUIRED for Production)

**⚠️ IMPORTANT:** The test domain `onboarding@resend.dev` can only send emails to your registered email address. To send emails to all users, you MUST verify a domain.

### Why Domain Verification is Required

- Test domain (`onboarding@resend.dev`) only works for your registered email
- Production requires a verified domain to send to any email address
- See `RESEND_DOMAIN_SETUP.md` for detailed instructions

### Quick Steps:

1. Purchase a domain (if you don't have one) - ~$10-15/year
2. Go to https://resend.com/domains
3. Click "Add Domain"
4. Follow the DNS setup instructions
5. Wait for DNS propagation (1-24 hours)
6. Once verified, use emails like `noreply@yourdomain.com`

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

