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
      // Handle Google OAuth sign in - Standard approach: auto-detect login vs signup
      if (account?.provider === 'google') {
        try {
          const db = getDb();
          const existingUser = await db.getUserByEmail(user.email!);
          
          // Standard OAuth flow: automatically handle login or signup
          // If user exists → login, if not → signup (just like GitHub, Slack, etc.)
          
          if (!existingUser) {
            // New user - automatically create account (signup)
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
            (user as any).isNewUser = true;
          } else {
            // Existing user - login
            user.id = existingUser.id;
            (user as any).isNewUser = false;
            
            // Link Google account if not already linked
            if (account) {
              const existingAccount = await db.getAccountByProvider(
                account.provider,
                account.providerAccountId
              );
              
              // Check if account exists but user is different (orphaned account scenario)
              if (existingAccount && existingAccount.user_id !== existingUser.id) {
                console.log('⚠️ Found orphaned account. Re-linking to current user:', {
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
      // Standard redirect - no special handling needed
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`;
      } else if (new URL(url).origin === baseUrl) {
        return url;
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



