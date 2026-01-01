import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { NextRequest } from 'next/server';

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
          // Store oauth_mode in authOptions - will be used in redirect callback
          (authOptions as any).currentOAuthMode = modeFromCallback;
          console.log('✅ Extracted oauth_mode from initial signin request:', modeFromCallback);
        }
      } catch (e) {
        console.error('Error parsing callbackUrl:', e);
      }
    }
  }
  
  // Check if this is the callback request (after Google redirect)
  // The oauth_mode will be extracted from the redirect URL in the redirect callback
  if (pathname.includes('/callback/google')) {
    // oauth_mode will be read from redirect callback URL
    // No need to read from cookie here
  }
  
  // Call NextAuth - DO NOT modify the response to avoid breaking redirect URI
  return NextAuth(authOptions)(req as any, context);
};

export { handler as GET, handler as POST };

