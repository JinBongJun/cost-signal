'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from './Button';
import { Card } from './Card';

export function WelcomeModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1); // 1: Welcome, 2: How it works
  const router = useRouter();

  useEffect(() => {
    // Check if user has seen the welcome modal before
    if (typeof window !== 'undefined') {
      const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
      if (!hasSeenWelcome) {
        // Small delay for better UX
        setTimeout(() => setIsOpen(true), 500);
      }
    }
  }, []);

  function handleClose() {
    setIsOpen(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem('hasSeenWelcome', 'true');
    }
  }

  function handleNext() {
    if (step === 1) {
      setStep(2);
    } else {
      handleClose();
    }
  }

  function handleLearnMore() {
    handleClose();
    router.push('/learn-more');
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <Card className="max-w-lg w-full animate-scale-in" padding="lg">
        {step === 1 ? (
          <>
            <div className="text-center mb-6">
              <div className="text-5xl mb-4">👋</div>
              <h2 className="text-2xl font-bold mb-2">Welcome to Cost Signal!</h2>
              <p className="text-gray-600 dark:text-gray-400">
                One clear signal. Every Monday. No opinions. Just data.
              </p>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex items-start gap-3">
                <div className="text-2xl">📊</div>
                <div>
                  <h3 className="font-semibold mb-1">Track 4 Key Indicators</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Gas Prices, Inflation, Interest Rates, and Unemployment
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="text-2xl">🏛️</div>
                <div>
                  <h3 className="font-semibold mb-1">Official Government Data</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    From EIA, BLS, and FRED - no opinions, just data
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="text-2xl">🚦</div>
                <div>
                  <h3 className="font-semibold mb-1">Simple Signal System</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    🟢 OK, 🟡 CAUTION, or 🔴 RISK - one clear signal every Monday
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button onClick={handleNext} variant="primary" className="flex-1">
                How it Works
              </Button>
              <Button onClick={handleClose} variant="ghost" className="flex-1">
                Skip
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="text-center mb-6">
              <div className="text-4xl mb-4">⚡</div>
              <h2 className="text-2xl font-bold mb-2">How It Works</h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Simple 3-step process to stay informed
              </p>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center font-bold text-blue-600 dark:text-blue-400">
                  1
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">We Track Economic Data</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Every week, we automatically collect data from official U.S. government sources (EIA, BLS, FRED)
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center font-bold text-blue-600 dark:text-blue-400">
                  2
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">We Calculate a Signal</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Using clear rules, we determine if changes are significant enough to affect your everyday costs
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center font-bold text-blue-600 dark:text-blue-400">
                  3
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">You Get One Clear Signal</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Every Monday, you receive a simple signal: 🟢 OK, 🟡 CAUTION, or 🔴 RISK - no confusion, no anxiety
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800 dark:text-blue-200 text-center">
                <strong>Free tier:</strong> Get the signal every week. <strong>Paid tier:</strong> See detailed explanations and historical trends.
              </p>
            </div>

            <div className="flex gap-3">
              <Button onClick={handleClose} variant="primary" className="flex-1">
                Get Started
              </Button>
              <Button onClick={handleLearnMore} variant="secondary" className="flex-1">
                Learn More
              </Button>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}

