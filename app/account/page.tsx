'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { useToast, ToastContainer } from '@/components/Toast';

interface Subscription {
  id: string;
  plan: 'monthly' | 'yearly' | 'early_bird';
  status: 'active' | 'canceled' | 'past_due' | 'trialing';
  current_period_start: number;
  current_period_end: number;
  cancel_at_period_end: boolean;
}

export default function AccountPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [canceling, setCanceling] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?redirect=/account');
      return;
    }

    if (session?.user) {
      fetchSubscription();
    }
  }, [session, status, router]);

  async function fetchSubscription() {
    try {
      const response = await fetch('/api/account/subscription');
      if (response.ok) {
        const data = await response.json();
        setSubscription(data.subscription);
      } else if (response.status === 404) {
        setSubscription(null);
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
      toast.error('Failed to load subscription information');
    } finally {
      setLoading(false);
    }
  }

  async function handleCancelSubscription() {
    if (!subscription || !confirm('Are you sure you want to cancel your subscription? You will continue to have access until the end of your billing period.')) {
      return;
    }

    setCanceling(true);
    try {
      const response = await fetch('/api/account/subscription/cancel', {
        method: 'POST',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to cancel subscription');
      }

      toast.success('Subscription canceled. You will continue to have access until the end of your billing period.');
      await fetchSubscription(); // Refresh subscription data
    } catch (error) {
      console.error('Error canceling subscription:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to cancel subscription');
    } finally {
      setCanceling(false);
    }
  }

  function formatDate(timestamp: number): string {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  function getPlanName(plan: string): string {
    const planNames: Record<string, string> = {
      monthly: 'Monthly',
      yearly: 'Yearly',
      early_bird: 'Early Bird',
    };
    return planNames[plan] || plan;
  }

  function getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      active: 'text-green-600 dark:text-green-400',
      canceled: 'text-red-600 dark:text-red-400',
      past_due: 'text-yellow-600 dark:text-yellow-400',
      trialing: 'text-blue-600 dark:text-blue-400',
    };
    return colors[status] || 'text-gray-600 dark:text-gray-400';
  }

  if (status === 'loading' || loading) {
    return (
      <main className="min-h-screen p-4 md:p-8 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-48 bg-gray-300 dark:bg-gray-700 rounded"></div>
            <div className="h-64 bg-gray-300 dark:bg-gray-700 rounded-lg"></div>
          </div>
        </div>
      </main>
    );
  }

  if (!session?.user) {
    return null; // Will redirect
  }

  return (
    <>
      <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />
      <main className="min-h-screen p-4 md:p-8 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Link href="/">
              <Button variant="ghost" size="sm">
                ← Back to home
              </Button>
            </Link>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold mb-8">Account</h1>

          {/* User Info */}
          <Card className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Profile</h2>
            <div className="space-y-2">
              <p className="text-gray-600 dark:text-gray-400">
                <span className="font-medium">Email:</span> {session.user.email}
              </p>
              {session.user.name && (
                <p className="text-gray-600 dark:text-gray-400">
                  <span className="font-medium">Name:</span> {session.user.name}
                </p>
              )}
            </div>
          </Card>

          {/* Subscription Info */}
          <Card>
            <h2 className="text-xl font-semibold mb-4">Subscription</h2>
            
            {subscription ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-medium">{getPlanName(subscription.plan)}</p>
                    <p className={`text-sm font-medium ${getStatusColor(subscription.status)}`}>
                      {subscription.status.toUpperCase()}
                    </p>
                  </div>
                  {subscription.status === 'active' && (
                    <div className="text-right">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Current Period</p>
                      <p className="text-sm font-medium">
                        {formatDate(subscription.current_period_start)} - {formatDate(subscription.current_period_end)}
                      </p>
                    </div>
                  )}
                </div>

                {subscription.cancel_at_period_end && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                    <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                      ⚠️ Your subscription will be canceled at the end of the current billing period ({formatDate(subscription.current_period_end)}).
                    </p>
                  </div>
                )}

                {subscription.status === 'active' && !subscription.cancel_at_period_end && (
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <Button
                      onClick={handleCancelSubscription}
                      disabled={canceling}
                      variant="danger"
                      isLoading={canceling}
                    >
                      Cancel Subscription
                    </Button>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      You will continue to have access until {formatDate(subscription.current_period_end)}.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  You don't have an active subscription.
                </p>
                <Link href="/pricing">
                  <Button variant="primary">
                    View Pricing Plans
                  </Button>
                </Link>
              </div>
            )}
          </Card>
        </div>
      </main>
    </>
  );
}

