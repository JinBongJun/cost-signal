import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { getDb } from '@/lib/db';
import type { SessionUser } from '@/lib/types';

export const dynamic = 'force-dynamic';

/**
 * GET /api/account/info
 * Get user account information including OAuth provider status
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = (session.user as SessionUser).id;
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID not found' },
        { status: 500 }
      );
    }

    const db = getDb();
    
    // Get user info
    const user = await db.getUserById(userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get linked accounts (OAuth providers)
    const accounts = await db.getUserAccounts(userId);
    const hasGoogleAccount = accounts.some((acc: { provider: string }) => acc.provider === 'google');
    const hasPassword = !!user.password;

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      hasPassword,
      hasGoogleAccount,
      providers: accounts.map((acc: { provider: string }) => acc.provider),
    });
  } catch (error) {
    console.error('Error fetching account info:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


