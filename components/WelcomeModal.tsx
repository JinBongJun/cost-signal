'use client';

import { useState, useEffect } from 'react';
import { Button } from './Button';
import { Card } from './Card';

export function WelcomeModal() {
  const [isOpen, setIsOpen] = useState(false);

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

  function handleLearnMore() {
    handleClose();
    // Trigger custom event to show Learn More section
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('showLearnMore'));
    }
    // Scroll to section after a small delay
    setTimeout(() => {
      const element = document.getElementById('why-cost-signal');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 200);
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <Card className="max-w-md w-full animate-scale-in" padding="lg">
        <div className="text-center mb-6">
          <div className="text-5xl mb-4">👋</div>
          <h2 className="text-2xl font-bold mb-2">Welcome to Cost Signal!</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Your weekly check on economic changes affecting everyday costs
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
          <Button onClick={() => handleClose(false)} variant="primary" className="flex-1">
            Get Started
          </Button>
          <Button onClick={handleLearnMore} variant="secondary" className="flex-1">
            Learn More
          </Button>
        </div>
      </Card>
    </div>
  );
}

