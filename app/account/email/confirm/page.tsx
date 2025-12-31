'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { Button } from '@/components/Button';
import { useToast, ToastContainer } from '@/components/Toast';

function EmailConfirmContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const toast = useToast();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link. Please request a new email change.');
      return;
    }

    async function confirmEmailChange() {
      try {
        const response = await fetch('/api/account/email/confirm', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (!response.ok) {
          setStatus('error');
          setMessage(data.error || 'Failed to confirm email change');
          toast.error(data.error || 'Failed to confirm email change');
          return;
        }

        setStatus('success');
        setMessage(data.message || 'Your email has been changed successfully.');
        toast.success('Email changed successfully! Please sign in again with your new email.');

        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } catch (error) {
        console.error('Error confirming email change:', error);
        setStatus('error');
        setMessage('An error occurred. Please try again later.');
        toast.error('An error occurred. Please try again later.');
      }
    }

    confirmEmailChange();
  }, [searchParams, router, toast]);

  return (
    <>
      <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />
      <Header />
      <main className="min-h-screen p-4 md:p-8 bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="max-w-md w-full">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            {status === 'loading' && (
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">Confirming email change...</p>
              </div>
            )}

            {status === 'success' && (
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Email Changed Successfully!</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">{message}</p>
                <p className="text-sm text-gray-500 dark:text-gray-500">Redirecting to login...</p>
              </div>
            )}

            {status === 'error' && (
              <div className="text-center">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Verification Failed</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">{message}</p>
                <Button
                  variant="primary"
                  onClick={() => router.push('/account')}
                  className="w-full"
                >
                  Go to Account Settings
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}

export default function EmailConfirmPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    }>
      <EmailConfirmContent />
    </Suspense>
  );
}

