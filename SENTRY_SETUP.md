# Sentry Setup Guide

This guide will help you set up Sentry error monitoring for Cost Signal.

## 1. Create a Sentry Account

1. Go to https://sentry.io/signup/
2. Sign up for a free account (or log in if you already have one)
3. Create a new project:
   - Select **Next.js** as your platform
   - Give it a name (e.g., "cost-signal")
   - Choose your organization

## 2. Get Your DSN

After creating the project, Sentry will provide you with a DSN (Data Source Name). It looks like:
```
https://xxxxx@xxxxx.ingest.sentry.io/xxxxx
```

## 3. Configure Environment Variables

Add the following to your `.env` file (and Vercel environment variables):

```env
# Sentry Configuration
NEXT_PUBLIC_SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx
SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx
SENTRY_ORG=your-org-name
SENTRY_PROJECT=your-project-name
SENTRY_AUTH_TOKEN=your-auth-token  # For source maps upload (optional)

# Enable Sentry in development (optional)
# SENTRY_ENABLE_IN_DEV=true
```

### Getting Your Auth Token (for source maps):

1. Go to Sentry → Settings → Account → Auth Tokens
2. Create a new token with `project:releases` scope
3. Add it to your environment variables

## 4. Test Sentry Integration

After deploying, you can test Sentry by:

1. Triggering a test error (add a button that throws an error)
2. Or wait for a real error to occur
3. Check your Sentry dashboard to see if errors are being captured

## 5. Configure Alerts (Optional)

1. Go to Sentry → Alerts
2. Create alert rules for:
   - New issues
   - High error rates
   - Performance issues

## Features

- **Automatic Error Tracking**: All unhandled errors are automatically captured
- **Source Maps**: Source maps are uploaded for better error debugging
- **Session Replay**: User sessions are recorded when errors occur (privacy-focused)
- **Performance Monitoring**: Track API response times and page load performance
- **Environment Filtering**: Errors are filtered by environment (development/production)

## Development Mode

By default, Sentry is disabled in development mode to avoid noise. To enable it:

```env
SENTRY_ENABLE_IN_DEV=true
```

## Notes

- Sentry free tier includes 5,000 events/month
- Source maps are automatically uploaded during build (if auth token is provided)
- Errors are filtered to exclude known non-critical issues (network errors, etc.)



