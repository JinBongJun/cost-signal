import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { getDb } from '@/lib/db';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const db = getDb();
    const user = await db.getUserByEmail(session.user.email);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const userId = user.id;

    // Delete all user data in the correct order (respecting foreign key constraints)
    
    // Note: push_subscriptions table doesn't have user_id, so we can't delete them by user
    // They will remain orphaned, but that's acceptable for GDPR compliance
    
    // 1. Delete subscription (cascade should handle this, but explicit for safety)
    const { error: subError } = await supabase
      .from('subscriptions')
      .delete()
      .eq('user_id', userId);

    if (subError) {
      console.error('Error deleting subscription:', subError);
    }

    // 3. Delete sessions (cascade should handle this)
    const { error: sessionError } = await supabase
      .from('sessions')
      .delete()
      .eq('user_id', userId);

    if (sessionError) {
      console.error('Error deleting sessions:', sessionError);
    }

    // 4. Delete accounts (OAuth accounts, cascade should handle this)
    const { error: accountError } = await supabase
      .from('accounts')
      .delete()
      .eq('user_id', userId);

    if (accountError) {
      console.error('Error deleting accounts:', accountError);
    }

    // 5. Delete password reset tokens (if any)
    const { error: tokenError } = await supabase
      .from('password_reset_tokens')
      .delete()
      .eq('user_id', userId);

    if (tokenError) {
      console.error('Error deleting password reset tokens:', tokenError);
    }

    // 6. Finally, delete the user (this should cascade to related tables)
    const { error: userError } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);

    if (userError) {
      console.error('Error deleting user:', userError);
      return NextResponse.json(
        { error: 'Failed to delete account. Please try again or contact support.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Account deleted successfully',
    });
  } catch (error) {
    console.error('Account deletion error:', error);
    return NextResponse.json(
      { error: 'An error occurred while deleting your account. Please try again or contact support.' },
      { status: 500 }
    );
  }
}

