'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { Header } from '@/components/Header';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { useToast, ToastContainer } from '@/components/Toast';
import { Suspense } from 'react';

function DeleteAccountForm() {
  const { data: session } = useSession();
  const router = useRouter();
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const toast = useToast();

  const requiredText = 'DELETE';

  async function handleDeleteAccount() {
    if (confirmText !== requiredText) {
      toast.error(`Please type "${requiredText}" to confirm`);
      return;
    }

    if (!confirm('Are you absolutely sure? This action cannot be undone. All your data will be permanently deleted.')) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch('/api/account/delete', {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete account');
      }

      toast.success('Your account has been deleted successfully.');
      
      // Sign out and redirect after a short delay
      setTimeout(async () => {
        await signOut({ callbackUrl: '/' });
      }, 1500);
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete account');
      setIsDeleting(false);
    }
  }

  if (!session?.user) {
    router.push('/login?redirect=/account/delete');
    return null;
  }

  return (
    <>
      <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />
      <Header />
      <main className="min-h-screen p-4 md:p-8 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 mt-6">Delete Account</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Permanently delete your account and all associated data.
          </p>

          <Card className="border-red-200 dark:border-red-800">
            <div className="space-y-6">
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <h2 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
                  ⚠️ Warning: This action cannot be undone
                </h2>
                <ul className="text-sm text-red-700 dark:text-red-300 space-y-2 list-disc list-inside">
                  <li>All your account data will be permanently deleted</li>
                  <li>Your subscription will be canceled immediately</li>
                  <li>All your push notification subscriptions will be removed</li>
                  <li>You will lose access to all paid features</li>
                  <li>This action is irreversible</li>
                </ul>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  To confirm, please type <span className="font-mono font-bold text-red-600 dark:text-red-400">{requiredText}</span> below:
                </label>
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-mono"
                  placeholder={requiredText}
                  autoComplete="off"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button
                  onClick={handleDeleteAccount}
                  disabled={isDeleting || confirmText !== requiredText}
                  isLoading={isDeleting}
                  variant="danger"
                  size="md"
                  className="min-h-[44px]"
                >
                  Delete My Account
                </Button>
                <Button
                  onClick={() => router.push('/account')}
                  disabled={isDeleting}
                  variant="secondary"
                  size="md"
                  className="min-h-[44px]"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Card>

          <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
            <p>
              If you're experiencing issues, please{' '}
              <a
                href="/feedback"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                contact us
              </a>
              {' '}before deleting your account.
            </p>
          </div>
        </div>
      </main>
    </>
  );
}

export default function DeleteAccountPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen p-4 md:p-8 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-2xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-48 bg-gray-300 dark:bg-gray-700 rounded"></div>
            <div className="h-64 bg-gray-300 dark:bg-gray-700 rounded-lg"></div>
          </div>
        </div>
      </main>
    }>
      <DeleteAccountForm />
    </Suspense>
  );
}

