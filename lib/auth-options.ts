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
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      // Handle Google OAuth sign in
      if (account?.provider === 'google') {
        try {
          const db = getDb();
          const existingUser = await db.getUserByEmail(user.email!);

          if (!existingUser) {
            // Create new user for Google sign in
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
            // User exists, check if Google account is linked
            user.id = existingUser.id;
            
            // Link Google account if not already linked
            if (account) {
              const existingAccount = await db.getAccountByProvider(
                account.provider,
                account.providerAccountId
              );
              
              if (!existingAccount) {
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
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || 'your-secret-key-change-in-production',
  debug: process.env.NODE_ENV === 'development',
  // Ensure NEXTAUTH_URL is used for callbacks
  url: process.env.NEXTAUTH_URL,
};



