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
  const [changingPassword, setChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [hasPassword, setHasPassword] = useState<boolean | null>(null);
  const [hasGoogleAccount, setHasGoogleAccount] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong' | ''>('');
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

  function checkPasswordStrength(value: string) {
    if (!value) {
      setPasswordStrength('');
      return;
    }

    let strength = 0;
    if (value.length >= 8) strength++;
    if (value.length >= 12) strength++;
    if (/[a-z]/.test(value) && /[A-Z]/.test(value)) strength++;
    if (/\d/.test(value)) strength++;
    if (/[^a-zA-Z\d]/.test(value)) strength++;

    if (strength <= 2) {
      setPasswordStrength('weak');
    } else if (strength <= 3) {
      setPasswordStrength('medium');
    } else {
      setPasswordStrength('strong');
    }
  }

  function validatePassword() {
    setPasswordError('');
    
    if (!currentPassword) {
      setPasswordError('Current password is required');
      return false;
    }

    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters');
      return false;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return false;
    }

    if (currentPassword === newPassword) {
      setPasswordError('New password must be different from current password');
      return false;
    }

    return true;
  }

  async function handleChangePassword() {
    if (!validatePassword()) {
      return;
    }

    setUpdatingPassword(true);
    try {
      const response = await fetch('/api/account/password', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to change password');
      }

      toast.success('Password changed successfully');
      setChangingPassword(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordError('');
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to change password');
    } finally {
      setUpdatingPassword(false);
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
      <Header />
      <main className="min-h-screen p-4 md:p-8 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-8 mt-6">Account</h1>

          {/* Navigation Tabs */}
          <div className="mb-6 flex gap-4 border-b border-gray-200 dark:border-gray-700">
            <Link
              href="/account"
              className="px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
            >
              Profile
            </Link>
            <Link
              href="/account/notifications"
              className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
            >
              Notifications
            </Link>
          </div>

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
                  Email is your account identifier and cannot be changed. If you need to change your email, please contact support.
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

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Password
                </label>
                {hasGoogleAccount && !hasPassword ? (
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <p className="text-blue-800 dark:text-blue-200 text-sm">
                      You signed in with Google. Password management is handled by your Google account. 
                      To change your password, please visit your{' '}
                      <a 
                        href="https://myaccount.google.com/security" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="underline font-medium hover:text-blue-900 dark:hover:text-blue-100"
                      >
                        Google Account settings
                      </a>.
                    </p>
                  </div>
                ) : changingPassword ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                        Current Password
                      </label>
                      <div className="relative">
                        <input
                          type={showCurrentPassword ? 'text' : 'password'}
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          placeholder="Enter current password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 p-1"
                          aria-label={showCurrentPassword ? 'Hide password' : 'Show password'}
                        >
                          {showCurrentPassword ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          value={newPassword}
                          onChange={(e) => {
                            setNewPassword(e.target.value);
                            checkPasswordStrength(e.target.value);
                          }}
                          className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          placeholder="Enter new password (min 8 characters)"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 p-1"
                          aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                        >
                          {showNewPassword ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          )}
                        </button>
                      </div>
                      {newPassword && (
                        <div className="mt-4">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="flex-1 h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                              <div
                                className={`h-full transition-all duration-300 ${
                                  passwordStrength === 'weak'
                                    ? 'bg-red-500 w-1/3'
                                    : passwordStrength === 'medium'
                                    ? 'bg-yellow-500 w-2/3'
                                    : passwordStrength === 'strong'
                                    ? 'bg-green-500 w-full'
                                    : ''
                                }`}
                              />
                            </div>
                            <span
                              className={`text-sm font-semibold min-w-[60px] ${
                                passwordStrength === 'weak'
                                  ? 'text-red-600 dark:text-red-400'
                                  : passwordStrength === 'medium'
                                  ? 'text-yellow-600 dark:text-yellow-400'
                                  : passwordStrength === 'strong'
                                  ? 'text-green-600 dark:text-green-400'
                                  : 'text-gray-500 dark:text-gray-400'
                              }`}
                            >
                              {passwordStrength === 'weak'
                                ? 'Weak'
                                : passwordStrength === 'medium'
                                ? 'Medium'
                                : passwordStrength === 'strong'
                                ? 'Strong'
                                : ''}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                            <div className={`flex items-center gap-2 ${newPassword.length >= 8 ? 'text-green-600 dark:text-green-400' : ''}`}>
                              <span className="text-base">{newPassword.length >= 8 ? '✓' : '○'}</span>
                              <span>At least 8 characters</span>
                            </div>
                            <div className={`flex items-center gap-2 ${/[a-z]/.test(newPassword) && /[A-Z]/.test(newPassword) ? 'text-green-600 dark:text-green-400' : ''}`}>
                              <span className="text-base">{/[a-z]/.test(newPassword) && /[A-Z]/.test(newPassword) ? '✓' : '○'}</span>
                              <span>Uppercase and lowercase letters</span>
                            </div>
                            <div className={`flex items-center gap-2 ${/\d/.test(newPassword) ? 'text-green-600 dark:text-green-400' : ''}`}>
                              <span className="text-base">{/\d/.test(newPassword) ? '✓' : '○'}</span>
                              <span>At least one number</span>
                            </div>
                            <div className={`flex items-center gap-2 ${/[^a-zA-Z\d]/.test(newPassword) ? 'text-green-600 dark:text-green-400' : ''}`}>
                              <span className="text-base">{/[^a-zA-Z\d]/.test(newPassword) ? '✓' : '○'}</span>
                              <span>At least one special character</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          placeholder="Confirm new password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 p-1 min-w-[44px] min-h-[44px] flex items-center justify-center"
                          aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                        >
                          {showConfirmPassword ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>

                    {passwordError && (
                      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                        <p className="text-red-800 dark:text-red-200 text-sm">{passwordError}</p>
                      </div>
                    )}

                    <div className="flex gap-3 pt-2">
                      <Button
                        onClick={handleChangePassword}
                        disabled={updatingPassword}
                        isLoading={updatingPassword}
                        variant="primary"
                        size="md"
                        className="min-h-[44px]"
                      >
                        Change Password
                      </Button>
                      <Button
                        onClick={() => {
                          setChangingPassword(false);
                          setCurrentPassword('');
                          setNewPassword('');
                          setConfirmPassword('');
                          setPasswordError('');
                          setPasswordStrength('');
                        }}
                        disabled={updatingPassword}
                        variant="secondary"
                        size="md"
                        className="min-h-[44px]"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : hasPassword !== false ? (
                  <Button
                    onClick={() => setChangingPassword(true)}
                    variant="secondary"
                    size="sm"
                  >
                    Change Password
                  </Button>
                ) : null}
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

