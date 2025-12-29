'use client';

import { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { 
  subscribeToPushNotifications, 
  unsubscribeFromPushNotifications,
  isSubscribedToPushNotifications 
} from '@/lib/push-client';

interface Signal {
  week_start: string;
  overall_status: 'ok' | 'caution' | 'risk';
  risk_count: number;
  explanation?: string | null; // Only for paid tier
  indicators?: Array<{
    type: string;
    value: number;
    previous_value: number | null;
    change_percent: number | null;
    status: 'ok' | 'risk';
  }>;
}

interface HistorySignal {
  week_start: string;
  overall_status: 'ok' | 'caution' | 'risk';
  risk_count: number;
  explanation: string | null;
  indicators: Array<{
    type: string;
    value: number;
    previous_value: number | null;
    change_percent: number | null;
    status: 'ok' | 'risk';
  }>;
}

const STATUS_EMOJI: Record<string, string> = {
  ok: '🟢',
  caution: '🟡',
  risk: '🔴',
};

const STATUS_LABEL: Record<string, string> = {
  ok: 'OK',
  caution: 'CAUTION',
  risk: 'RISK',
};

const STATUS_COLOR: Record<string, string> = {
  ok: 'text-green-600 dark:text-green-400',
  caution: 'text-yellow-600 dark:text-yellow-400',
  risk: 'text-red-600 dark:text-red-400',
};

const INDICATOR_LABELS: Record<string, string> = {
  gas: 'Gas Prices',
  cpi: 'Inflation (CPI)',
  interest_rate: 'Interest Rates',
  unemployment: 'Unemployment',
};

export default function Home() {
  const { data: session, status } = useSession();
  const [signal, setSignal] = useState<Signal | null>(null);
  const [history, setHistory] = useState<HistorySignal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tier, setTier] = useState<'free' | 'paid'>('free');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    fetchSignal();
    checkSubscriptionStatus();
    checkInstallStatus();
    checkUserSubscription();
    
    // Listen for beforeinstallprompt event
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, [tier, session]);

  async function checkUserSubscription() {
    if (session?.user) {
      try {
        // Try to fetch paid tier data - if successful, user has subscription
        const response = await fetch('/api/signal?tier=paid');
        if (response.ok) {
          setHasActiveSubscription(true);
          if (tier === 'free') {
            setTier('paid'); // Auto-upgrade if user has subscription
          }
        } else {
          setHasActiveSubscription(false);
        }
      } catch (err) {
        setHasActiveSubscription(false);
      }
    } else {
      setHasActiveSubscription(false);
      setTier('free');
    }
  }

  async function checkSubscriptionStatus() {
    if ('serviceWorker' in navigator) {
      const subscribed = await isSubscribedToPushNotifications();
      setIsSubscribed(subscribed);
    }
  }

  function checkInstallStatus() {
    // Check if app is installed (standalone mode)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isIOSStandalone = (window.navigator as any).standalone === true;
    setIsInstalled(isStandalone || isIOSStandalone);
  }

  async function fetchSignal() {
    setLoading(true);
    setError(null);
    try {
      // Add minimum loading time for better UX
      // This ensures users see the skeleton UI even on fast connections
      const minLoadingTime = 800; // 800ms minimum
      const startTime = Date.now();
      
      const response = await fetch(`/api/signal?tier=${tier}`, {
        cache: 'no-store', // Prevent caching for testing
      });
      if (!response.ok) {
        throw new Error('Failed to fetch signal');
      }
      const data = await response.json();
      
      // Ensure minimum loading time for better UX
      const elapsed = Date.now() - startTime;
      if (elapsed < minLoadingTime) {
        await new Promise(resolve => setTimeout(resolve, minLoadingTime - elapsed));
      }
      
      setSignal(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  async function fetchHistory() {
    if (tier !== 'paid') return;
    
    try {
      const response = await fetch('/api/history?limit=12');
      if (!response.ok) {
        throw new Error('Failed to fetch history');
      }
      const data = await response.json();
      setHistory(data.signals || []);
    } catch (err) {
      console.error('Error fetching history:', err);
    }
  }

  useEffect(() => {
    if (tier === 'paid' && showHistory) {
      fetchHistory();
    }
  }, [tier, showHistory]);

  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }

  function formatValue(type: string, value: number): string {
    switch (type) {
      case 'gas':
        return `$${value.toFixed(2)}/gal`;
      case 'cpi':
        return value.toFixed(2);
      case 'interest_rate':
        return `${value.toFixed(2)}%`;
      case 'unemployment':
        return `${value.toFixed(2)}%`;
      default:
        return value.toFixed(2);
    }
  }

  async function handleSubscribe() {
    if ('serviceWorker' in navigator) {
      // Register service worker first
      try {
        await navigator.serviceWorker.register('/sw.js');
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }

    const subscription = await subscribeToPushNotifications();
    if (subscription) {
      setIsSubscribed(true);
      alert('✅ Notifications enabled! You\'ll receive weekly economic signals every Monday.');
    } else {
      alert('Failed to enable notifications. Please check your browser notification settings.');
    }
  }

  async function handleUnsubscribe() {
    const success = await unsubscribeFromPushNotifications();
    if (success) {
      setIsSubscribed(false);
      alert('Notifications disabled.');
    }
  }

  async function handleInstall() {
    if (!deferredPrompt) {
      alert('App is already installed or installation is not available.');
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setIsInstalled(true);
      setDeferredPrompt(null);
    }
  }

  // Show loading state if:
  // 1. Initial data is loading
  // 2. Session is still loading
  // 3. Signal data is not available yet
  const isLoading = loading || status === 'loading' || !signal;
  
  // Skeleton Loading Component
  if (isLoading) {
    return (
      <main className="min-h-screen p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header Skeleton */}
          <header className="mb-8 text-center">
            <div className="h-12 w-48 bg-gray-300 dark:bg-gray-700 rounded animate-pulse mx-auto mb-4"></div>
            <div className="h-6 w-80 bg-gray-300 dark:bg-gray-700 rounded animate-pulse mx-auto"></div>
          </header>

          {/* Buttons Skeleton */}
          <div className="mb-6 flex flex-col items-center gap-3">
            <div className="h-10 w-64 bg-gray-300 dark:bg-gray-700 rounded-lg animate-pulse"></div>
          </div>

          {/* Auth Status Skeleton */}
          <div className="mb-6 flex justify-center items-center gap-4">
            <div className="h-8 w-48 bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
          </div>

          {/* Tier Display Skeleton */}
          <div className="mb-6 flex justify-center">
            <div className="h-10 w-32 bg-gray-300 dark:bg-gray-700 rounded-lg animate-pulse"></div>
          </div>

          {/* Main Signal Card Skeleton */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 md:p-8 mb-6">
            <div className="text-center mb-6">
              {/* Emoji Circle Skeleton */}
              <div className="w-24 h-24 rounded-full bg-gray-300 dark:bg-gray-700 animate-pulse mx-auto mb-4"></div>
              
              {/* Status Text Skeleton */}
              <div className="h-10 w-32 bg-gray-300 dark:bg-gray-700 rounded animate-pulse mx-auto mb-2"></div>
              
              {/* Date Text Skeleton */}
              <div className="h-5 w-64 bg-gray-300 dark:bg-gray-700 rounded animate-pulse mx-auto"></div>
            </div>

            {/* Explanation Skeleton (for paid tier) */}
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mb-6">
              <div className="space-y-2">
                <div className="h-4 w-full bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
                <div className="h-4 w-5/6 bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
                <div className="h-4 w-4/6 bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
              </div>
            </div>

            {/* Upgrade Prompt Skeleton (for free tier) */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
              <div className="h-5 w-40 bg-gray-300 dark:bg-gray-700 rounded animate-pulse mb-2"></div>
              <div className="h-4 w-full bg-gray-300 dark:bg-gray-700 rounded animate-pulse mb-3"></div>
              <div className="h-9 w-40 bg-gray-300 dark:bg-gray-700 rounded-lg animate-pulse"></div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">Error: {error}</p>
          <button
            onClick={fetchSignal}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </main>
    );
  }

  if (!signal) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">No signal data available yet.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-2">Cost Signal</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Weekly economic signal for U.S. consumers
          </p>
        </header>

        {/* Install & Notification Buttons */}
        <div className="mb-6 flex flex-col items-center gap-3">
          {!isInstalled && deferredPrompt && (
            <button
              onClick={handleInstall}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              📱 Install App
            </button>
          )}
          
          {!isSubscribed ? (
            <button
              onClick={handleSubscribe}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              🔔 Enable Weekly Notifications
            </button>
          ) : (
            <button
              onClick={handleUnsubscribe}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
            >
              🔕 Disable Notifications
            </button>
          )}
        </div>

        {/* Test Loading Button (Development only) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-4 flex justify-center">
            <button
              onClick={() => {
                setLoading(true);
                setTimeout(() => fetchSignal(), 100);
              }}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
            >
              🔄 Test Loading UI
            </button>
          </div>
        )}

        {/* User Auth Status */}
        <div className="mb-6 flex justify-center items-center gap-4">
          {session?.user ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Signed in as {session.user.email}
              </span>
              {hasActiveSubscription ? (
                <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm font-medium">
                  Paid
                </span>
              ) : (
                <Link
                  href="/pricing"
                  className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium hover:bg-blue-200 dark:hover:bg-blue-800"
                >
                  Upgrade to Paid
                </Link>
              )}
              <button
                onClick={() => signOut()}
                className="text-sm text-gray-500 dark:text-gray-400 hover:underline"
              >
                Sign out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link
                href="/login"
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>

        {/* Tier Display (read-only based on subscription) */}
        {session?.user && (
          <div className="mb-6 flex justify-center">
            <div className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {hasActiveSubscription ? 'Paid Tier' : 'Free Tier'}
              </span>
            </div>
          </div>
        )}

        {/* Main Signal Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 md:p-8 mb-6">
          <div className="text-center mb-6">
            <div className="text-6xl mb-4">{STATUS_EMOJI[signal.overall_status]}</div>
            <h2 className={`text-3xl md:text-4xl font-bold mb-2 ${STATUS_COLOR[signal.overall_status]}`}>
              {STATUS_LABEL[signal.overall_status]}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Week of {formatDate(signal.week_start)}
            </p>
          </div>

          {/* Explanation - Paid tier only */}
          {tier === 'paid' && signal.explanation && (
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mb-6">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {signal.explanation}
              </p>
            </div>
          )}

          {/* Free tier upgrade prompt */}
          {tier === 'free' && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
              <p className="text-blue-800 dark:text-blue-200 text-sm mb-2">
                <strong>Want to understand why?</strong>
              </p>
              <p className="text-blue-700 dark:text-blue-300 text-sm mb-3">
                Upgrade to see detailed explanations, indicator breakdowns, and historical trends.
              </p>
              <button
                onClick={() => setTier('paid')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                View Paid Features
              </button>
            </div>
          )}

          {/* Individual Indicators (Paid tier only) */}
          {tier === 'paid' && signal.indicators && signal.indicators.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold mb-4">Indicator Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {signal.indicators.map((indicator, idx) => (
                  <div
                    key={idx}
                    className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        {INDICATOR_LABELS[indicator.type] || indicator.type}
                      </span>
                      <span
                        className={`text-sm font-semibold ${
                          indicator.status === 'risk'
                            ? 'text-red-600 dark:text-red-400'
                            : 'text-green-600 dark:text-green-400'
                        }`}
                      >
                        {indicator.status === 'risk' ? 'RISK' : 'OK'}
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                      {formatValue(indicator.type, indicator.value)}
                    </div>
                    {indicator.previous_value !== null && indicator.change_percent !== null && (
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {indicator.change_percent > 0 ? '+' : ''}
                        {indicator.change_percent.toFixed(2)}% from previous
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* History Section (Paid tier only) */}
          {tier === 'paid' && (
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Historical Signals</h3>
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                >
                  {showHistory ? 'Hide' : 'Show'} History
                </button>
              </div>
              
              {showHistory && (
                <div className="space-y-3">
                  {history.length > 0 ? (
                    history.map((histSignal) => (
                      <div
                        key={histSignal.week_start}
                        className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {formatDate(histSignal.week_start)}
                          </span>
                          <span className={`text-lg font-semibold ${STATUS_COLOR[histSignal.overall_status]}`}>
                            {STATUS_EMOJI[histSignal.overall_status]} {STATUS_LABEL[histSignal.overall_status]}
                          </span>
                        </div>
                        {histSignal.explanation && (
                          <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
                            {histSignal.explanation}
                          </p>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Loading history...</p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="text-center text-sm text-gray-500 dark:text-gray-400">
          <p className="mb-2">
            Cost Signal provides a neutral summary of economic indicators.
          </p>
          <p>
            This is not financial advice. Data from official U.S. government sources.
          </p>
        </footer>
      </div>
    </main>
  );
}

