import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { NextRequest } from 'next/server';

// Store oauth_mode from callback URL in a way accessible to signIn callback
// This is a workaround for NextAuth's limitation
// We need to extract it from both initial signin request and callback request
let currentOAuthMode: 'login' | 'signup' | null = null;

const handler = async (req: NextRequest, context: any) => {
  const url = req.nextUrl;
  const pathname = url.pathname;
  
  // Check if this is the initial signin request (before Google redirect)
  if (pathname.includes('/signin/google')) {
    const callbackUrl = url.searchParams.get('callbackUrl');
    if (callbackUrl) {
      try {
        const callbackUrlObj = new URL(callbackUrl, url.origin);
        const modeFromCallback = callbackUrlObj.searchParams.get('oauth_mode') as 'login' | 'signup' | null;
        if (modeFromCallback) {
          currentOAuthMode = modeFromCallback;
          (authOptions as any).currentOAuthMode = modeFromCallback;
          console.log('✅ Extracted oauth_mode from initial signin request:', modeFromCallback);
        }
      } catch (e) {
        console.error('Error parsing callbackUrl:', e);
      }
    }
  }
  
  // Check if this is the callback request (after Google redirect)
  // The state parameter might contain the callbackUrl
  if (pathname.includes('/callback/google')) {
    // Try to decode state parameter (NextAuth encodes it)
    const state = url.searchParams.get('state');
    if (state && currentOAuthMode) {
      // Mode was already set from initial request, keep it
      (authOptions as any).currentOAuthMode = currentOAuthMode;
      console.log('✅ Preserving oauth_mode in callback:', currentOAuthMode);
    }
  }
  
  return NextAuth(authOptions)(req as any, context);
};

export { handler as GET, handler as POST };

