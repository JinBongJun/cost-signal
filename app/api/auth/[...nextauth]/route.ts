import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { NextRequest } from 'next/server';

// Standard NextAuth handler - no custom oauth_mode logic needed
// OAuth flow automatically handles login/signup based on user existence
const handler = async (req: NextRequest, context: any) => {
  return NextAuth(authOptions)(req as any, context);
};

export { handler as GET, handler as POST };
