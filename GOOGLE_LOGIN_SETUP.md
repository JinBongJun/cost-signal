# Google Login Setup Guide

This guide will help you set up Google OAuth login for Cost Signal.

## 1. Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API:
   - Go to "APIs & Services" → "Library"
   - Search for "Google+ API" or "Google Identity"
   - Click "Enable"

## 2. Create OAuth 2.0 Client ID

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. If prompted, configure the OAuth consent screen:
   - Choose "External" (unless you have a Google Workspace)
   - Fill in the required information:
     - App name: "Cost Signal"
     - User support email: Your email
     - Developer contact: Your email
   - Add scopes: `email`, `profile`
   - Save and continue

4. Create OAuth client:
   - Application type: "Web application"
   - Name: "Cost Signal Web Client"
   - Authorized JavaScript origins:
     - `http://localhost:3000` (for development)
     - `https://your-domain.vercel.app` (for production)
   - Authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback/google` (for development)
     - `https://your-domain.vercel.app/api/auth/callback/google` (for production)
   - Click "Create"

5. Copy the Client ID and Client Secret

## 3. Configure Environment Variables

Add the following to your `.env` file (and Vercel environment variables):

```env
# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

## 4. Test Google Login

1. Start your development server: `npm run dev`
2. Go to `/login` or `/signup`
3. Click "Sign in with Google" or "Sign up with Google"
4. You should be redirected to Google's login page
5. After signing in, you'll be redirected back to your app

## Features

- **Automatic Account Creation**: If a user signs in with Google for the first time, an account is automatically created
- **Account Linking**: If a user already has an account with the same email, the Google account is linked
- **Email Verification**: Google accounts are automatically verified (email_verified is set)

## Notes

- Users can sign in with either email/password or Google
- If a user signs up with email/password first, they can later link their Google account
- The same email can be used for both authentication methods

