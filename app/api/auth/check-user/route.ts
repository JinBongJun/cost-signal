import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { getDb } from '@/lib/db';
import type { SessionUser } from '@/lib/types';

export const dynamic = 'force-dynamic';

/**
 * GET /api/auth/check-user
 * Check if the current user was just created (within last 5 seconds)
 * This helps distinguish between new signups and existing logins
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
    const user = await db.getUserById(userId);
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user was created within the last 5 seconds
    // This indicates a new signup
    const now = new Date();
    const userCreatedAt = user.created_at ? new Date(user.created_at) : null;
    const isNewUser = userCreatedAt && (now.getTime() - userCreatedAt.getTime()) < 5000;

    return NextResponse.json({
      isNewUser: !!isNewUser,
      createdAt: userCreatedAt?.toISOString() || null,
    });
  } catch (error) {
    console.error('Error checking user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

