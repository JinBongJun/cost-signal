'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { Button } from '@/components/Button';
import Link from 'next/link';

function ErrorContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const error = searchParams?.get('error');
  const errorDescription = searchParams?.get('errorDescription');

  // Determine error message based on error type
  let title = 'Access Denied';
  let message = 'You do not have permission to sign in.';
  let actionLabel = 'Go to Login';
  let actionUrl = '/login';

  if (error === 'AccessDenied') {
    // Check if this is a login or signup error
    if (errorDescription?.includes('login') || errorDescription?.includes('not registered') || errorDescription === 'login_attempt_with_non_existent_user') {
      title = 'Account Not Found';
      message = 'This account is not registered. Please sign up first.';
      actionLabel = 'Go to Sign Up';
      actionUrl = '/signup';
    } else if (errorDescription?.includes('signup') || errorDescription?.includes('already exists') || errorDescription === 'signup_attempt_with_existing_user') {
      title = 'Account Already Exists';
      message = 'This account already exists. Please sign in instead.';
      actionLabel = 'Go to Login';
      actionUrl = '/login';
    }
  }

  return (
    <>
      <Header />
      <main className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-md w-full">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              {title}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {message}
            </p>
            <div className="flex gap-3 justify-center">
              <Button
                variant="primary"
                onClick={() => router.push(actionUrl)}
                className="min-h-[44px]"
              >
                {actionLabel}
              </Button>
              <Button
                variant="secondary"
                onClick={() => router.push('/')}
                className="min-h-[44px]"
              >
                Go Home
              </Button>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <>
        <Header />
        <main className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-md w-full">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded mb-4"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded mb-8"></div>
              </div>
            </div>
          </div>
        </main>
      </>
    }>
      <ErrorContent />
    </Suspense>
  );
}

