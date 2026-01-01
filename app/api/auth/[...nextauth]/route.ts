import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { NextRequest, NextResponse } from 'next/server';

const OAUTH_MODE_COOKIE_NAME = 'oauth_mode';
const OAUTH_MODE_COOKIE_MAX_AGE = 300; // 5 minutes

const handler = async (req: NextRequest, context: any) => {
  const url = req.nextUrl;
  const pathname = url.pathname;
  
  // Debug: Log redirect URI information
  if (pathname.includes('/signin/google') || pathname.includes('/callback/google')) {
    console.log('🔍 OAuth Request Debug:');
    console.log('  - Request URL:', url.toString());
    console.log('  - Request Host:', req.headers.get('host'));
    console.log('  - NEXTAUTH_URL:', process.env.NEXTAUTH_URL);
    console.log('  - Expected redirect URI:', `${process.env.NEXTAUTH_URL || `https://${req.headers.get('host')}`}/api/auth/callback/google`);
  }
  
  // Check if this is the initial signin request (before Google redirect)
  if (pathname.includes('/signin/google')) {
    const callbackUrl = url.searchParams.get('callbackUrl');
    if (callbackUrl) {
      try {
        const callbackUrlObj = new URL(callbackUrl, url.origin);
        const modeFromCallback = callbackUrlObj.searchParams.get('oauth_mode') as 'login' | 'signup' | null;
        if (modeFromCallback) {
          // Store oauth_mode in authOptions for immediate access
          (authOptions as any).currentOAuthMode = modeFromCallback;
          (authOptions as any).oauthModeCookieValue = modeFromCallback;
          console.log('✅ Extracted oauth_mode from initial signin request:', modeFromCallback);
        }
      } catch (e) {
        console.error('Error parsing callbackUrl:', e);
      }
    }
  }
  
  // Check if this is the callback request (after Google redirect)
  if (pathname.includes('/callback/google')) {
    // Read oauth_mode from cookie
    const oauthModeCookie = req.cookies.get(OAUTH_MODE_COOKIE_NAME);
    if (oauthModeCookie?.value) {
      const oauthMode = oauthModeCookie.value as 'login' | 'signup';
      (authOptions as any).currentOAuthMode = oauthMode;
      (authOptions as any).oauthModeCookieValue = oauthMode;
      console.log('✅ Retrieved oauth_mode from cookie:', oauthMode);
    } else {
      // Fallback: check if stored in authOptions (from initial request)
      const storedMode = (authOptions as any).oauthModeCookieValue;
      if (storedMode) {
        (authOptions as any).currentOAuthMode = storedMode;
        console.log('✅ Using stored oauth_mode from initial request:', storedMode);
      }
    }
  }
  
  // Call NextAuth
  const authResponse = await NextAuth(authOptions)(req as any, context);
  
  // If this was the initial signin request and we have oauth_mode, set cookie
  // IMPORTANT: Only add header, don't modify response body to avoid breaking redirect URI
  if (pathname.includes('/signin/google')) {
    const storedMode = (authOptions as any).oauthModeCookieValue;
    if (storedMode && authResponse instanceof Response) {
      // Clone response to add cookie header without modifying body
      const response = new Response(authResponse.body, {
        status: authResponse.status,
        statusText: authResponse.statusText,
        headers: authResponse.headers,
      });
      
      // Add cookie header (append to preserve existing Set-Cookie headers)
      response.headers.append(
        'Set-Cookie',
        `${OAUTH_MODE_COOKIE_NAME}=${storedMode}; HttpOnly; Secure=${process.env.NODE_ENV === 'production'}; SameSite=Lax; Max-Age=${OAUTH_MODE_COOKIE_MAX_AGE}; Path=/`
      );
      
      return response;
    }
  }
  
  // If this was the callback request, delete cookie
  if (pathname.includes('/callback/google') && authResponse instanceof Response) {
    // Clone response to add cookie deletion header
    const response = new Response(authResponse.body, {
      status: authResponse.status,
      statusText: authResponse.statusText,
      headers: authResponse.headers,
    });
    
    // Delete cookie
    response.headers.append(
      'Set-Cookie',
      `${OAUTH_MODE_COOKIE_NAME}=; HttpOnly; Secure=${process.env.NODE_ENV === 'production'}; SameSite=Lax; Max-Age=0; Path=/`
    );
    
    return response;
  }
  
  return authResponse;
};

export { handler as GET, handler as POST };

