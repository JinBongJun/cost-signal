import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { NextRequest } from 'next/server';

const OAUTH_MODE_COOKIE_NAME = 'oauth_mode';
const OAUTH_MODE_COOKIE_MAX_AGE = 300; // 5 minutes

const handler = async (req: NextRequest, context: any) => {
  const url = req.nextUrl;
  const pathname = url.pathname;
  
  // Extract oauth_mode from callbackUrl for signin request
  if (pathname.includes('/signin/google')) {
    const callbackUrl = url.searchParams.get('callbackUrl');
    console.log('🔍 Initial signin request:');
    console.log('  - callbackUrl:', callbackUrl);
    
    if (callbackUrl) {
      try {
        const callbackUrlObj = new URL(callbackUrl, url.origin);
        const modeFromCallback = callbackUrlObj.searchParams.get('oauth_mode') as 'login' | 'signup' | null;
        console.log('  - Extracted oauth_mode:', modeFromCallback);
        
        if (modeFromCallback) {
          // Store oauth_mode in authOptions for signIn callback
          (authOptions as any).currentOAuthMode = modeFromCallback;
          console.log('  - Stored oauth_mode in authOptions');
        }
      } catch (e) {
        console.error('Error parsing callbackUrl:', e);
      }
    }
  }
  
  // Read oauth_mode from cookie for callback request
  if (pathname.includes('/callback/google')) {
    const oauthModeCookie = req.cookies.get(OAUTH_MODE_COOKIE_NAME);
    console.log('🔍 Callback request:');
    console.log('  - Cookie value:', oauthModeCookie?.value);
    
    if (oauthModeCookie?.value) {
      const oauthMode = oauthModeCookie.value as 'login' | 'signup';
      (authOptions as any).currentOAuthMode = oauthMode;
      console.log('  - Retrieved oauth_mode from cookie:', oauthMode);
    } else {
      console.log('  - ⚠️ No oauth_mode cookie found!');
    }
  }
  
  // Call NextAuth - let it handle redirect URI generation automatically
  const authResponse = await NextAuth(authOptions)(req as any, context);
  
  // If there was an error, add errorDescription to redirect URL
  if (pathname.includes('/callback/google') && authResponse instanceof Response) {
    const lastError = (authOptions as any).lastError;
    if (lastError && authResponse.status >= 300 && authResponse.status < 400) {
      // This is a redirect response (likely to error page)
      const location = authResponse.headers.get('Location');
      if (location && location.includes('/api/auth/error')) {
        const errorUrl = new URL(location, url.origin);
        if (lastError.type === 'signup') {
          errorUrl.searchParams.set('errorDescription', 'signup_attempt_with_existing_user');
        } else if (lastError.type === 'login') {
          errorUrl.searchParams.set('errorDescription', 'login_attempt_with_non_existent_user');
        }
        
        const modifiedResponse = new Response(authResponse.body, {
          status: authResponse.status,
          statusText: authResponse.statusText,
          headers: new Headers(authResponse.headers),
        });
        modifiedResponse.headers.set('Location', errorUrl.toString());
        return modifiedResponse;
      }
    }
  }
  
  // Set cookie for signin request (before redirect to Google)
  // CRITICAL: Only modify headers, don't touch response body to avoid breaking redirect URI
  if (pathname.includes('/signin/google') && authResponse instanceof Response) {
    const storedMode = (authOptions as any).currentOAuthMode;
    if (storedMode) {
      // Clone response to add Set-Cookie header
      // IMPORTANT: Use response.clone() or create new Response with same body
      const response = new Response(authResponse.body, {
        status: authResponse.status,
        statusText: authResponse.statusText,
        headers: new Headers(authResponse.headers),
      });
      
      // Add cookie header
      response.headers.append(
        'Set-Cookie',
        `${OAUTH_MODE_COOKIE_NAME}=${storedMode}; HttpOnly; Secure=${process.env.NODE_ENV === 'production'}; SameSite=Lax; Max-Age=${OAUTH_MODE_COOKIE_MAX_AGE}; Path=/`
      );
      
      return response;
    }
  }
  
  // Delete cookie for callback request (after Google redirect)
  if (pathname.includes('/callback/google') && authResponse instanceof Response) {
    const response = new Response(authResponse.body, {
      status: authResponse.status,
      statusText: authResponse.statusText,
      headers: new Headers(authResponse.headers),
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
