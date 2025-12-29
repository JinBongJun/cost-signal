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
  paddle_subscription_id?: string;
}

interface Transaction {
  id: string;
  status: string;
  total: string;
  currency_code: string;
  created_at: string;
  billing_period?: {
    starts_at: string;
    ends_at: string;
  };
}

export default function AccountPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [canceling, setCanceling] = useState(false);
  const [showTransactions, setShowTransactions] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState(session?.user?.name || '');
  const [updatingName, setUpdatingName] = useState(false);
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

  async function fetchTransactions() {
    if (!subscription?.paddle_subscription_id) return;

    setTransactionsLoading(true);
    try {
      const response = await fetch(`/api/account/transactions?subscription_id=${subscription.paddle_subscription_id}`);
      if (response.ok) {
        const data = await response.json();
        setTransactions(data.transactions || []);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast.error('Failed to load payment history');
    } finally {
      setTransactionsLoading(false);
    }
  }

  useEffect(() => {
    if (showTransactions && subscription?.paddle_subscription_id) {
      fetchTransactions();
    }
  }, [showTransactions, subscription?.paddle_subscription_id]);

  useEffect(() => {
    if (session?.user?.name) {
      setNewName(session.user.name);
    }
  }, [session?.user?.name]);

  async function handleUpdateName() {
    if (!newName.trim()) {
      toast.error('Name cannot be empty');
      return;
    }

    setUpdatingName(true);
    try {
      const response = await fetch('/api/account/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newName.trim() }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update name');
      }

      toast.success('Name updated successfully');
      setEditingName(false);
      // Refresh session to get updated name
      window.location.reload();
    } catch (error) {
      console.error('Error updating name:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update name');
    } finally {
      setUpdatingName(false);
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
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <p className="text-gray-600 dark:text-gray-400">{session.user.email}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Email cannot be changed
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Name
                </label>
                {editingName ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      placeholder="Your name"
                      autoFocus
                    />
                    <Button
                      onClick={handleUpdateName}
                      disabled={updatingName}
                      isLoading={updatingName}
                      variant="primary"
                      size="sm"
                    >
                      Save
                    </Button>
                    <Button
                      onClick={() => {
                        setEditingName(false);
                        setNewName(session?.user?.name || '');
                      }}
                      disabled={updatingName}
                      variant="secondary"
                      size="sm"
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <p className="text-gray-600 dark:text-gray-400 flex-1">
                      {session.user.name || 'Not set'}
                    </p>
                    <Button
                      onClick={() => setEditingName(true)}
                      variant="secondary"
                      size="sm"
                    >
                      Edit
                    </Button>
                  </div>
                )}
              </div>
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

                {/* Payment History */}
                {subscription.status === 'active' && (
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700 mt-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">Payment History</h3>
                      <Button
                        onClick={() => setShowTransactions(!showTransactions)}
                        variant="secondary"
                        size="sm"
                      >
                        {showTransactions ? 'Hide' : 'Show'} History
                      </Button>
                    </div>

                    {showTransactions && (
                      <div className="space-y-3">
                        {transactionsLoading ? (
                          <div className="text-center py-4">
                            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Loading transactions...</p>
                          </div>
                        ) : transactions.length > 0 ? (
                          transactions.map((tx) => (
                            <div
                              key={tx.id}
                              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg"
                            >
                              <div>
                                <p className="font-medium text-sm">
                                  {new Date(tx.created_at).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                  })}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {tx.status === 'completed' ? 'Paid' : tx.status}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold">
                                  {tx.currency_code === 'USD' ? '$' : ''}
                                  {parseFloat(tx.total).toFixed(2)}
                                  {tx.currency_code !== 'USD' ? ` ${tx.currency_code}` : ''}
                                </p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                            No payment history available yet.
                          </p>
                        )}
                      </div>
                    )}
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

