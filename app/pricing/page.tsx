'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useToast, ToastContainer } from '@/components/Toast';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export default function PricingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const toast = useToast();

  async function handleSubscribe(plan: 'monthly' | 'yearly') {
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
      id: 'monthly',
      name: 'Monthly',
      price: '$4.99',
      period: '/month',
      description: 'Flexible monthly subscription',
      features: [
        'Weekly economic signal with detailed explanations',
        'Individual indicator breakdowns (Gas, CPI, Interest Rates, Unemployment)',
        'Historical signal trends (12+ weeks)',
        'Push notifications for weekly updates',
      ],
    },
    {
      id: 'yearly',
      name: 'Yearly',
      price: '$39.99',
      period: '/year',
      description: 'Save 33% with annual plan',
      badge: 'Best Value',
      popular: true,
      originalPrice: '$59.88',
      savings: 'Save $19.89/year',
      features: [
        'Weekly economic signal with detailed explanations',
        'Individual indicator breakdowns (Gas, CPI, Interest Rates, Unemployment)',
        'Historical signal trends (12+ weeks)',
        'Push notifications for weekly updates',
      ],
    },
  ];

  return (
    <>
      <Header />
      <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />
      <main className="min-h-screen p-4 md:p-8 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <header className="text-center mb-12 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">Pricing</h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-2">
              Simple, transparent pricing. No hidden fees.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              All plans include push notifications and weekly updates
            </p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-12 max-w-4xl mx-auto">
            {plans.map((plan, idx) => (
              <Card
                key={plan.id}
                padding="lg"
                hover
                className={`relative transition-all duration-300 ${
                  plan.popular 
                    ? 'ring-2 ring-blue-500 shadow-xl scale-105 md:scale-110' 
                    : 'hover:shadow-lg'
                }`}
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                    <span className="bg-gradient-to-r from-blue-600 to-blue-700 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg">
                      {plan.badge || 'Popular'}
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">{plan.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{plan.description}</p>

                  <div className="mb-2">
                    <span className="text-5xl font-bold text-gray-900 dark:text-white">{plan.price}</span>
                    <span className="text-gray-600 dark:text-gray-400 text-lg ml-1">{plan.period}</span>
                  </div>
                  {plan.originalPrice && (
                    <div className="text-sm text-gray-500 dark:text-gray-400 line-through mb-1">
                      {plan.originalPrice}/year
                    </div>
                  )}
                  {plan.savings && (
                    <div className="text-sm text-green-600 dark:text-green-400 font-semibold">
                      {plan.savings}
                    </div>
                  )}
                </div>

                <ul className="space-y-3 mb-8 min-h-[200px]">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="text-green-500 dark:text-green-400 mr-3 flex-shrink-0 mt-0.5 text-lg">✓</span>
                      <span className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => handleSubscribe(plan.id as 'monthly' | 'yearly')}
                  disabled={loading !== null}
                  isLoading={loading === plan.id}
                  variant={plan.popular ? 'primary' : 'secondary'}
                  className="w-full min-h-[48px] font-semibold"
                >
                  {loading === plan.id 
                    ? 'Processing...' 
                    : session 
                      ? 'Subscribe Now' 
                      : 'Sign In to Subscribe'}
                </Button>
              </Card>
            ))}
          </div>

          <Card className="mt-12 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border-2 border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <h3 className="text-2xl font-semibold mb-2 text-gray-900 dark:text-white">Free Tier</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Start with our free tier and upgrade when you need more insights:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto mb-6">
                <div className="text-left">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Free Tier Includes:</h4>
                  <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 dark:text-green-400 text-lg flex-shrink-0">✓</span>
                      <span>Weekly economic signal (🟢🟡🔴)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 dark:text-green-400 text-lg flex-shrink-0">✓</span>
                      <span>Push notifications</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-gray-400 dark:text-gray-600 text-lg flex-shrink-0">🔒</span>
                      <span className="text-gray-500 dark:text-gray-500">Detailed explanation (locked)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-gray-400 dark:text-gray-600 text-lg flex-shrink-0">🔒</span>
                      <span className="text-gray-500 dark:text-gray-500">Indicator details (locked)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-gray-400 dark:text-gray-600 text-lg flex-shrink-0">🔒</span>
                      <span className="text-gray-500 dark:text-gray-500">Historical trends (locked)</span>
                    </li>
                  </ul>
                </div>
                <div className="text-left">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Paid Tier Unlocks:</h4>
                  <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 dark:text-blue-400 text-lg flex-shrink-0">✨</span>
                      <span>AI-powered detailed explanations</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 dark:text-blue-400 text-lg flex-shrink-0">✨</span>
                      <span>Individual indicator breakdowns</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 dark:text-blue-400 text-lg flex-shrink-0">✨</span>
                      <span>Historical trends (12+ weeks)</span>
                    </li>
                  </ul>
                </div>
              </div>
              <Link href="/">
                <Button variant="primary" className="min-h-[48px]">
                  Continue with free tier →
                </Button>
              </Link>
            </div>
          </Card>

          <div className="mt-12 text-center space-y-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              💳 Secure payment processing by Paddle
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              All subscriptions can be cancelled at any time. No hidden fees.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
