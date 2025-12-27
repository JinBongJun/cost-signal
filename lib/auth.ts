/**
 * Authentication utilities
 * Cost optimization: Simple JWT-based auth, no external services
 */

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { getDb } from './db';

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  return session?.user || null;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Unauthorized');
  }
  return user;
}

export async function hasActiveSubscription(userId: string): Promise<boolean> {
  const db = getDb();
  const subscription = await db.getSubscriptionByUserId(userId);
  
  if (!subscription) {
    return false;
  }

  // Check if subscription is active and not expired
  if (subscription.status !== 'active' && subscription.status !== 'trialing') {
    return false;
  }

  // Check if subscription period has ended
  if (subscription.current_period_end) {
    const now = Math.floor(Date.now() / 1000);
    if (subscription.current_period_end < now) {
      return false;
    }
  }

  return true;
}

export async function requirePaidTier() {
  const user = await requireAuth();
  const userId = (user as any).id;
  if (!userId) {
    throw new Error('User ID not found');
  }
  const hasSubscription = await hasActiveSubscription(userId);
  
  if (!hasSubscription) {
    throw new Error('Paid subscription required');
  }
  
  return user;
}



