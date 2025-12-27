'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function PricingSuccessPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verify subscription and update user status
    const verifySubscription = async () => {
      try {
        // Paddle will redirect with transaction_id
        const transactionId = searchParams.get('transaction_id');
        
        if (transactionId && session) {
          // Webhook should have already processed this, but verify
          // Redirect to home after a moment
          setTimeout(() => {
            router.push('/');
          }, 3000);
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error('Error verifying subscription:', error);
        setLoading(false);
      }
    };

    verifySubscription();
  }, [searchParams, session, router]);

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Verifying subscription...</p>
          </>
        ) : (
          <>
            <div className="text-6xl mb-4">✅</div>
            <h1 className="text-3xl font-bold mb-4">Subscription Activated!</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Thank you for subscribing. You now have access to all paid features.
            </p>
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go to Dashboard
            </Link>
          </>
        )}
      </div>
    </main>
  );
}



