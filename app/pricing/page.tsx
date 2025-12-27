'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function PricingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState('');

  async function handleSubscribe(plan: 'monthly' | 'yearly' | 'early_bird') {
    if (!session) {
      router.push('/login?redirect=/pricing');
      return;
    }

    setLoading(plan);
    setError('');

    try {
      const response = await fetch('/api/paddle/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ plan }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout');
      }

      // Redirect to Paddle checkout
      if (data.checkout_url) {
        window.location.href = data.checkout_url;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setLoading(null);
    }
  }

  const plans = [
    {
      id: 'early_bird',
      name: 'Early Bird',
      price: '$2.99',
      period: '/month',
      description: 'Limited time offer for first 100 users',
      features: [
        'All paid features',
        'Detailed explanations',
        'Indicator breakdowns',
        'Historical signals',
        'Email summaries',
      ],
      popular: true,
    },
    {
      id: 'monthly',
      name: 'Monthly',
      price: '$4.99',
      period: '/month',
      description: 'Flexible monthly subscription',
      features: [
        'All paid features',
        'Detailed explanations',
        'Indicator breakdowns',
        'Historical signals',
        'Email summaries',
      ],
    },
    {
      id: 'yearly',
      name: 'Yearly',
      price: '$49.99',
      period: '/year',
      description: 'Save 17% with annual plan',
      originalPrice: '$59.88',
      features: [
        'All paid features',
        'Detailed explanations',
        'Indicator breakdowns',
        'Historical signals',
        'Email summaries',
        'Priority support',
      ],
    },
  ];

  return (
    <main className="min-h-screen p-4 md:p-8 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Pricing</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Choose the plan that works for you
          </p>
        </header>

        {error && (
          <div className="max-w-2xl mx-auto mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 ${
                plan.popular ? 'ring-2 ring-blue-500' : ''
              }`}
            >
              {plan.popular && (
                <div className="bg-blue-600 text-white text-sm font-semibold px-3 py-1 rounded-full inline-block mb-4">
                  Popular
                </div>
              )}

              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">{plan.description}</p>

              <div className="mb-6">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-gray-600 dark:text-gray-400">{plan.period}</span>
                {plan.originalPrice && (
                  <div className="text-sm text-gray-500 line-through mt-1">
                    {plan.originalPrice}/year
                  </div>
                )}
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSubscribe(plan.id as 'monthly' | 'yearly' | 'early_bird')}
                disabled={loading !== null}
                className={`w-full px-6 py-3 rounded-lg font-semibold transition-colors ${
                  plan.popular
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {loading === plan.id ? 'Processing...' : 'Subscribe'}
              </button>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link
            href="/"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            ← Back to home
          </Link>
        </div>

        <div className="mt-12 bg-white dark:bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Free Tier</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Not ready to upgrade? You can still use Cost Signal for free:
          </p>
          <ul className="space-y-2 text-gray-700 dark:text-gray-300">
            <li>✓ Weekly economic signal (🟢🟡🔴)</li>
            <li>✓ Push notifications</li>
            <li>✓ Basic information</li>
          </ul>
          <Link
            href="/"
            className="inline-block mt-4 text-blue-600 dark:text-blue-400 hover:underline"
          >
            Continue with free tier →
          </Link>
        </div>
      </div>
    </main>
  );
}



