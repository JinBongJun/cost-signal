'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useToast, ToastContainer } from '@/components/Toast';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';

export default function PricingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const toast = useToast();

  async function handleSubscribe(plan: 'monthly' | 'yearly' | 'early_bird') {
    if (!session) {
      router.push('/login?redirect=/pricing');
      return;
    }

    setLoading(plan);

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
        toast.info('Redirecting to checkout...');
        window.location.href = data.checkout_url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      toast.error(errorMessage);
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
      badge: 'Best Value',
      features: [
        'Weekly economic signal with detailed explanations',
        'Individual indicator breakdowns (Gas, CPI, Interest Rates, Unemployment)',
        'Historical signal trends (12+ weeks)',
        'Push notifications for weekly updates',
        'Early access to new features',
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
        'Weekly economic signal with detailed explanations',
        'Individual indicator breakdowns',
        'Historical signal trends (12+ weeks)',
        'Push notifications for weekly updates',
      ],
    },
    {
      id: 'yearly',
      name: 'Yearly',
      price: '$49.99',
      period: '/year',
      description: 'Save 17% with annual plan',
      originalPrice: '$59.88',
      savings: 'Save $10.89/year',
      features: [
        'Weekly economic signal with detailed explanations',
        'Individual indicator breakdowns',
        'Historical signal trends (12+ weeks)',
        'Push notifications for weekly updates',
        'Priority customer support',
        'Early access to new features',
      ],
    },
  ];

  return (
    <>
      <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />
      <main className="min-h-screen p-4 md:p-8 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <header className="text-center mb-12 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Pricing</h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Choose the plan that works for you
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              All plans include push notifications and weekly updates
            </p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {plans.map((plan, idx) => (
              <Card
                key={plan.id}
                padding="lg"
                hover
                className={`relative transition-smooth animate-scale-in ${
                  plan.popular ? 'ring-2 ring-blue-500 shadow-xl' : ''
                }`}
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-600 text-white text-xs font-semibold px-4 py-1 rounded-full">
                      {plan.badge || 'Popular'}
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{plan.description}</p>

                  <div className="mb-2">
                    <span className="text-5xl font-bold">{plan.price}</span>
                    <span className="text-gray-600 dark:text-gray-400 text-lg">{plan.period}</span>
                  </div>
                  {plan.originalPrice && (
                    <div className="text-sm text-gray-500 line-through mb-1">
                      {plan.originalPrice}/year
                    </div>
                  )}
                  {plan.savings && (
                    <div className="text-sm text-green-600 dark:text-green-400 font-medium">
                      {plan.savings}
                    </div>
                  )}
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="text-green-500 mr-2 flex-shrink-0 mt-0.5">✓</span>
                      <span className="text-sm text-gray-700 dark:text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => handleSubscribe(plan.id as 'monthly' | 'yearly' | 'early_bird')}
                  disabled={loading !== null}
                  isLoading={loading === plan.id}
                  variant={plan.popular ? 'primary' : 'secondary'}
                  className="w-full"
                >
                  {loading === plan.id ? 'Processing...' : session ? 'Subscribe Now' : 'Sign In to Subscribe'}
                </Button>
              </Card>
            ))}
          </div>

          <div className="text-center mb-12">
            <Link href="/">
              <Button variant="ghost" size="sm">
                ← Back to home
              </Button>
            </Link>
          </div>

          <Card className="mt-12">
            <div className="text-center">
              <h3 className="text-2xl font-semibold mb-4">Free Tier</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Not ready to upgrade? You can still use Cost Signal for free:
              </p>
              <ul className="space-y-3 text-gray-700 dark:text-gray-300 mb-6 max-w-md mx-auto">
                <li className="flex items-center justify-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Weekly economic signal (🟢🟡🔴)</span>
                </li>
                <li className="flex items-center justify-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Push notifications for weekly updates</span>
                </li>
                <li className="flex items-center justify-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Basic economic information</span>
                </li>
              </ul>
              <Link href="/">
                <Button variant="primary">
                  Continue with free tier →
                </Button>
              </Link>
            </div>
          </Card>

          <div className="mt-12 text-center text-sm text-gray-500 dark:text-gray-400">
            <p className="mb-2">
              💳 Secure payment processing by Paddle
            </p>
            <p>
              All subscriptions can be cancelled at any time. No hidden fees.
            </p>
          </div>
        </div>
      </main>
    </>
  );
}





