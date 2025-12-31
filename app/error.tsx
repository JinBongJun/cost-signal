'use client';

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to Sentry
    Sentry.captureException(error);
  }, [error]);

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
      <Card className="max-w-md w-full text-center">
        <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
          Something went wrong!
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          We're sorry, but something unexpected happened. Our team has been notified.
        </p>
        <div className="flex gap-3 justify-center">
          <Button onClick={reset} variant="primary">
            Try again
          </Button>
          <Button
            onClick={() => (window.location.href = '/')}
            variant="secondary"
          >
            Go home
          </Button>
        </div>
      </Card>
    </main>
  );
}


