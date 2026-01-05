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
  // past_due subscriptions should not have access
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

/**
 * Check if subscription is in a problematic state (past_due, paused, etc.)
 */
export async function isSubscriptionProblematic(userId: string): Promise<boolean> {
  const db = getDb();
  const subscription = await db.getSubscriptionByUserId(userId);
  
  if (!subscription) {
    return false;
  }

  // Check for problematic statuses
  return subscription.status === 'past_due' || subscription.status === 'paused';
}

export async function isAdmin(userId: string): Promise<boolean> {
  const db = getDb();
  const user = await db.getUserById(userId);
  
  if (!user) {
    console.log('isAdmin: User not found for userId:', userId);
    return false;
  }
  
  // Check if user email is in admin list (from environment variable)
  const adminEmailsRaw = process.env.ADMIN_EMAILS || '';
  const adminEmails = adminEmailsRaw.split(',').map(email => email.trim().toLowerCase()).filter(email => email.length > 0);
  const userEmail = user.email?.toLowerCase();
  
  console.log('isAdmin check:', {
    userId,
    userEmail,
    adminEmailsRaw,
    adminEmails,
    isAdmin: userEmail ? adminEmails.includes(userEmail) : false
  });
  
  return userEmail ? adminEmails.includes(userEmail) : false;
}

export async function requirePaidTier() {
  const user = await requireAuth();
  const userId = (user as any).id;
  if (!userId) {
    throw new Error('User ID not found');
  }
  
  // Check if user is admin first
  const userIsAdmin = await isAdmin(userId);
  if (userIsAdmin) {
    return user;
  }
  
  const hasSubscription = await hasActiveSubscription(userId);
  
  if (!hasSubscription) {
    throw new Error('Paid subscription required');
  }
  
  return user;
}



