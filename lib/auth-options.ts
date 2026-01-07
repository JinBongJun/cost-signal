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
          // Check Supabase connection first
          const { supabase } = await import('@/lib/supabase');
          const supabaseUrl = process.env.SUPABASE_URL;
          const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
          
          if (!supabaseUrl || !supabaseKey) {
            console.warn('⚠️ Supabase not configured - allowing sign in without DB persistence');
            // Generate temporary ID for user
            if (!user.id) {
              user.id = uuidv4();
            }
            return true; // Allow sign in even without DB
          }
          
          const db = getDb();
          console.log('🔍 Google OAuth sign in attempt:', {
            email: user.email,
            provider: account.provider,
            providerAccountId: account.providerAccountId,
            supabaseConfigured: !!supabaseUrl && !!supabaseKey
          });
          
          const existingUser = await db.getUserByEmail(user.email!);
          console.log('  - Existing user found:', !!existingUser);
          
          // Standard OAuth flow: automatically handle login or signup
          // If user exists → login, if not → signup (just like GitHub, Slack, etc.)
          
          if (!existingUser) {
            // New user - automatically create account (signup)
            console.log('  - Creating new user account...');
            const userId = uuidv4();
            
            try {
              await db.createUser({
                id: userId,
                email: user.email!,
                name: user.name || undefined,
                emailVerified: new Date(),
              });
              console.log('  - ✅ User created:', userId);
            } catch (createError) {
              console.error('  - ❌ Failed to create user:', createError);
              throw createError;
            }

            // Link Google account
            if (account) {
              try {
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
                console.log('  - ✅ Google account linked');
              } catch (linkError: any) {
                console.error('  - ❌ Failed to link account:', linkError);
                // Check if it's a duplicate key error (account already exists)
                if (linkError.message?.includes('duplicate') || linkError.message?.includes('unique') || linkError.code === '23505') {
                  console.log('  - ⚠️ Account already exists, trying to find and update...');
                  // Try to find the existing account and update it
                  const existingAccount = await db.getAccountByProvider(
                    account.provider,
                    account.providerAccountId
                  );
                  if (existingAccount && existingAccount.user_id !== userId) {
                    // Orphaned account - delete it and create new one
                    console.log('  - Deleting orphaned account and creating new link...');
                    const { supabase } = await import('@/lib/supabase');
                    await supabase
                      .from('accounts')
                      .delete()
                      .eq('provider', account.provider)
                      .eq('provider_account_id', account.providerAccountId);
                    
                    // Retry linking
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
                    console.log('  - ✅ Account re-linked successfully');
                  }
                } else {
                  throw linkError;
                }
              }
            }

            user.id = userId;
            (user as any).isNewUser = true;
            console.log('  - ✅ Signup completed successfully');
          } else {
            // Existing user - login
            console.log('  - Logging in existing user:', existingUser.id);
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
                try {
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
                  console.log('  - ✅ Google account linked to existing user');
                } catch (linkError: any) {
                  // If duplicate, that's OK - account already linked
                  if (linkError.message?.includes('duplicate') || linkError.message?.includes('unique') || linkError.code === '23505') {
                    console.log('  - ℹ️ Account already linked (this is OK)');
                  } else {
                    console.error('  - ⚠️ Failed to link account (non-critical):', linkError);
                    // Don't throw - account linking is optional for existing users
                  }
                }
              } else {
                console.log('  - ℹ️ Account already linked');
              }
            }
            console.log('  - ✅ Login completed successfully');
          }
        } catch (error) {
          console.error('❌ Error in Google sign in:', error);
          console.error('❌ Error details:', error instanceof Error ? error.message : String(error));
          console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace');
          
          // Check if it's a Supabase connection error
          const errorMessage = error instanceof Error ? error.message : String(error);
          if (errorMessage.includes('supabaseUrl') || errorMessage.includes('Supabase') || errorMessage.includes('connection')) {
            console.error('⚠️ Supabase connection error - allowing sign in but user may not be saved');
            // Allow sign in even if database is unavailable (user can still use the app)
            // The user object will be created in JWT but not persisted to DB
            if (!user.id) {
              user.id = uuidv4(); // Generate temporary ID
            }
            return true; // Allow sign in despite DB error
          }
          
          // For other errors, check if user already exists (might be a race condition)
          if (user.email) {
            try {
              const db = getDb();
              const existingUser = await db.getUserByEmail(user.email);
              if (existingUser) {
                console.log('⚠️ Error occurred but user exists - allowing sign in');
                user.id = existingUser.id;
                return true; // Allow sign in if user exists
              }
            } catch (retryError) {
              console.error('⚠️ Retry check also failed:', retryError);
            }
          }
          
          // Only block sign in for critical errors
          console.error('❌ Critical error - blocking sign in');
          return false;
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
        // Pass isNewUser to session for client-side notification
        if ((token as any).isNewUser !== undefined) {
          (session.user as any).isNewUser = (token as any).isNewUser;
        }
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || 'your-secret-key-change-in-production',
  debug: process.env.NODE_ENV === 'development',
};



