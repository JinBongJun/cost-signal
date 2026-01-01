import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { getDb } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

// Build providers array conditionally
const providers: any[] = [
  CredentialsProvider({
    name: 'Credentials',
    credentials: {
      email: { label: 'Email', type: 'email' },
      password: { label: 'Password', type: 'password' },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) {
        return null;
      }

      try {
        const db = getDb();
        const user = await db.getUserByEmail(credentials.email);

        if (!user || !user.password) {
          return null;
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);

        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      } catch (error) {
        console.error('Auth error:', error);
        return null;
      }
    },
  }),
];

// Only add Google provider if credentials are configured
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: 'select_account', // Always show account selection screen
        },
      },
    })
  );
} else {
  console.warn('Google OAuth not configured: GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are required');
}

export const authOptions: NextAuthOptions = {
  providers,
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/login',
    error: '/api/auth/error', // Custom error page
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      // Handle Google OAuth sign in
      if (account?.provider === 'google') {
        try {
          const db = getDb();
          const existingUser = await db.getUserByEmail(user.email!);
          
          // Get oauth_mode from authOptions (set by API route from cookie)
          const oauthMode = (authOptions as any).currentOAuthMode as 'login' | 'signup' | null;
          
          console.log('🔍 signIn callback debug:');
          console.log('  - Email:', user.email);
          console.log('  - oauthMode:', oauthMode);
          console.log('  - existingUser:', !!existingUser);
          if (existingUser) {
            console.log('  - existingUser.id:', existingUser.id);
            console.log('  - existingUser.email:', existingUser.email);
          }
          
          // 정석: 로그인 모드인데 사용자가 없으면 바로 에러
          if (oauthMode === 'login' && !existingUser) {
            console.log('❌ Login attempt with non-existent user:', user.email);
            // Store error type for error page
            (authOptions as any).lastError = { type: 'login', email: user.email };
            // Access Denied - 바로 에러!
            // NextAuth will redirect to /api/auth/error?error=AccessDenied
            return false;
          }
          
          // 정석: 회원가입 모드인데 사용자가 이미 있으면 바로 에러
          if (oauthMode === 'signup' && existingUser) {
            console.log('❌ Signup attempt with existing user:', user.email);
            console.log('  - This account already exists. User should use login instead.');
            // Store error type for error page
            (authOptions as any).lastError = { type: 'signup', email: user.email };
            // Access Denied - 바로 에러!
            // NextAuth will redirect to /api/auth/error?error=AccessDenied
            return false;
          }
          
          // oauth_mode가 null인 경우 로그
          if (!oauthMode) {
            console.log('⚠️ oauth_mode is null. Allowing default behavior.');
            console.log('  - existingUser:', !!existingUser);
            console.log('  - Will proceed with:', existingUser ? 'login' : 'signup');
          }
          
          // Store user existence status in user object for redirect callback
          (user as any).isNewUser = !existingUser;
          
          if (!existingUser) {
            // New user - signup flow (only allow if oauth_mode is signup or not set)
            const userId = uuidv4();
            await db.createUser({
              id: userId,
              email: user.email!,
              name: user.name || undefined,
              emailVerified: new Date(),
            });

            // Link Google account
            if (account) {
              await db.linkAccount({
                id: uuidv4(),
                userId,
                type: account.type,
                provider: account.provider,
                providerAccountId: account.providerAccountId,
                access_token: account.access_token,
                expires_at: account.expires_at,
                token_type: account.token_type,
                scope: account.scope,
                id_token: account.id_token,
              });
            }

            user.id = userId;
          } else {
            // Existing user - login flow (only allow if oauth_mode is login or not set)
            user.id = existingUser.id;
            
            // Link Google account if not already linked
            if (account) {
              const existingAccount = await db.getAccountByProvider(
                account.provider,
                account.providerAccountId
              );
              
              // Check if account exists but user is different (orphaned account scenario)
              // This can happen if a user was deleted but the account record wasn't cleaned up
              if (existingAccount && existingAccount.user_id !== existingUser.id) {
                console.log('⚠️ Found orphaned account. User ID mismatch:', {
                  accountUserId: existingAccount.user_id,
                  currentUserId: existingUser.id,
                  provider: account.provider,
                  providerAccountId: account.providerAccountId
                });
                // Treat as if account doesn't exist - will create new link
              }
              
              if (!existingAccount || (existingAccount.user_id !== existingUser.id)) {
                await db.linkAccount({
                  id: uuidv4(),
                  userId: existingUser.id,
                  type: account.type,
                  provider: account.provider,
                  providerAccountId: account.providerAccountId,
                  access_token: account.access_token,
                  expires_at: account.expires_at,
                  token_type: account.token_type,
                  scope: account.scope,
                  id_token: account.id_token,
                });
              }
            }
          }
        } catch (error) {
          console.error('Error in Google sign in:', error);
          console.error('Error details:', error instanceof Error ? error.message : String(error));
          console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
          return false; // Block sign in on database errors
        }
      }
      return true;
    },
    async redirect({ url, baseUrl }) {
      // NextAuth automatically uses NEXTAUTH_URL for baseUrl if set
      // Just clean up oauth_mode parameter from URL (already handled by API route)
      try {
        const urlObj = new URL(url, baseUrl);
        urlObj.searchParams.delete('oauth_mode');
        
        if (url.startsWith('/')) {
          return `${baseUrl}${urlObj.pathname}${urlObj.search}`;
        } else if (urlObj.origin === baseUrl) {
          return urlObj.toString();
        }
      } catch (error) {
        console.error('Error parsing redirect URL:', error);
      }
      
      return baseUrl;
    },
    async jwt({ token, user, account, trigger }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        // Store isNewUser status from signIn callback
        if ((user as any).isNewUser !== undefined) {
          (token as any).isNewUser = (user as any).isNewUser;
        }
      }
      
      // If session is being updated (e.g., after profile change), refresh user data from DB
      if (trigger === 'update' && token.id) {
        try {
          const db = getDb();
          const dbUser = await db.getUserById(token.id as string);
          if (dbUser) {
            token.email = dbUser.email;
            token.name = dbUser.name;
          }
        } catch (error) {
          console.error('Error refreshing user data in JWT:', error);
        }
      }
      
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string | null | undefined;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || 'your-secret-key-change-in-production',
  debug: process.env.NODE_ENV === 'development',
};



