'use client';

import { useState } from 'react';
import { Card } from '@/components/Card';
import Link from 'next/link';
import { Button } from '@/components/Button';
import { Header } from '@/components/Header';

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: 'What is Cost Signal?',
    answer: 'Cost Signal is a simple weekly check on whether recent U.S. economic changes are likely to affect everyday living costs. We provide a clear signal (🟢 OK, 🟡 CAUTION, or 🔴 RISK) based on official government data.',
  },
  {
    question: 'How is the signal calculated?',
    answer: 'We track 4 key economic indicators (Gas Prices, Inflation, Interest Rates, Unemployment) from official U.S. government sources. Each indicator is evaluated using rule-based logic, and the overall signal is determined by the number of risk indicators. See our "Learn More" section for detailed calculation methods.',
  },
  {
    question: 'How often is the signal updated?',
    answer: 'The signal is updated every Monday with the latest data from government sources. You can enable push notifications to receive alerts when new signals are available.',
  },
  {
    question: 'Is this financial advice?',
    answer: 'No. Cost Signal provides informational data only. We do not provide financial advice, investment recommendations, or encourage any spending or saving behavior. The signal is meant to inform, not to guide financial decisions.',
  },
  {
    question: 'What data sources do you use?',
    answer: 'We use only official U.S. government sources: EIA (Energy Information Administration) for gas prices, BLS (Bureau of Labor Statistics) for inflation data, and FRED (Federal Reserve Economic Data) for interest rates and unemployment.',
  },
  {
    question: 'What\'s the difference between free and paid tiers?',
    answer: 'Free tier includes the overall signal and explanation. Paid tier adds detailed breakdowns for each indicator, historical trends, and priority support.',
  },
  {
    question: 'Can I cancel my subscription?',
    answer: 'Yes, you can cancel your subscription at any time from your account page. You will continue to have access until the end of your billing period.',
  },
  {
    question: 'How do push notifications work?',
    answer: 'Push notifications are sent every Monday when new signal data is available. You can enable or disable them at any time from the notifications settings page. Notifications work on both web and mobile (PWA).',
  },
  {
    question: 'Is my data secure?',
    answer: 'Yes. We use industry-standard security measures including password encryption, secure HTTPS connections, and secure cloud storage. We do not sell your data to third parties. See our Privacy Policy for more details.',
  },
  {
    question: 'What if I forget my password?',
    answer: 'Click "Forgot your password?" on the login page, enter your email address, and we\'ll send you a password reset link. The link will expire in 1 hour. If you signed up with Google, you can use the "Sign in with Google" option instead.',
  },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <>
      <Header />
      <main className="min-h-screen p-4 md:p-8 bg-gray-50 dark:bg-gray-900">
        <div className="w-full mx-auto px-4 md:px-8">

        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Frequently Asked Questions</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Everything you need to know about Cost Signal
          </p>
        </header>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <Card
              key={index}
              className="cursor-pointer transition-all hover:shadow-lg"
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-gray-100">
                    {faq.question}
                  </h3>
                  {openIndex === index && (
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed animate-fade-in">
                      {faq.answer}
                    </p>
                  )}
                </div>
                <button
                  className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-transform"
                  aria-label={openIndex === index ? 'Close' : 'Open'}
                >
                  <svg
                    className={`w-6 h-6 transition-transform ${openIndex === index ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            </Card>
          ))}
        </div>

        <Card className="mt-12 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-3 text-blue-900 dark:text-blue-100">
              Still have questions?
            </h3>
            <p className="text-blue-800 dark:text-blue-200 mb-4">
              Check out our <Link href="/learn-more" className="underline font-medium">Learn More</Link> page or contact support through your account settings.
            </p>
          </div>
        </Card>
      </div>
    </main>
    </>
  );
}

