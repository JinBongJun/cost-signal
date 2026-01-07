'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  subscribeToPushNotifications, 
  unsubscribeFromPushNotifications,
  isSubscribedToPushNotifications 
} from '@/lib/push-client';
import { useToast, ToastContainer } from '@/components/Toast';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { SignalCard } from '@/components/SignalCard';
import { HistorySection } from '@/components/HistorySection';
import { WelcomeModal } from '@/components/WelcomeModal';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ImpactBreakdown } from '@/components/ImpactBreakdown';
import { ActionableInsights } from '@/components/ActionableInsights';
import { Predictions } from '@/components/Predictions';
import { SavingsOpportunities } from '@/components/SavingsOpportunities';
import { ROISummary } from '@/components/ROISummary';
import { TrustBadge } from '@/components/TrustBadge';
import type { SessionUser } from '@/lib/types';

interface Signal {
  week_start: string;
  overall_status: 'ok' | 'caution' | 'risk';
  risk_count: number;
  explanation?: string | null;
  explanation_type?: 'basic' | 'detailed'; // 'basic' for free tier, 'detailed' for paid
  isAdmin?: boolean; // Admin status from API
  indicators?: Array<{
    type: string;
    value?: number;
    previous_value?: number | null;
    change_percent?: number | null;
    status?: 'ok' | 'caution' | 'risk'; // Optional for free tier
    locked?: boolean; // true for free tier locked indicators
    direction?: 'up' | 'down' | 'neutral'; // For free tier: direction only
    updated_at?: string; // ISO date string
  }>;
  impactAnalysis?: {
    totalWeeklyChange: number;
    breakdown: Array<{
      indicator: 'gas' | 'cpi' | 'interest_rate' | 'unemployment';
      impact: number;
      level: 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';
      context?: string;
    }>;
    spendingPattern?: {
      gas_frequency?: 'daily' | 'weekly' | 'biweekly' | 'monthly' | null;
      monthly_rent?: number | null;
      food_ratio?: 'low' | 'medium' | 'high' | null;
      transport_mode?: 'car' | 'public' | 'mixed' | null;
      has_debt?: boolean | null;
    };
    averageImpact?: {
      totalWeeklyChange: number;
      breakdown: Array<{
        indicator: 'gas' | 'cpi' | 'interest_rate' | 'unemployment';
        impact: number;
        level: 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';
      }>;
    };
    insights?: Array<{
      id: string;
      type: 'gas' | 'cpi' | 'interest_rate' | 'general';
      priority: 'high' | 'medium' | 'low';
      title: string;
      description: string;
      action: string;
      potentialSavings: number;
      urgency: 'now' | 'this_week' | 'soon';
      icon: string;
    }>;
    predictions?: Array<{
      indicator: 'gas' | 'cpi' | 'interest_rate' | 'unemployment';
      direction: 'up' | 'down' | 'stable';
      confidence: 'high' | 'medium' | 'low';
      expectedChange: number;
      recommendation: string;
      timing: 'optimal' | 'good' | 'avoid';
    }>;
    savingsOpportunities?: Array<{
      id: string;
      title: string;
      description: string;
      currentPattern: string;
      suggestedChange: string;
      weeklySavings: number;
      monthlySavings: number;
      difficulty: 'easy' | 'medium' | 'hard';
      category: 'transport' | 'shopping' | 'debt' | 'lifestyle';
    }>;
  };
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
    status: 'ok' | 'caution' | 'risk';
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

function HomeContent() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [signal, setSignal] = useState<Signal | null>(null);
  const [history, setHistory] = useState<HistorySignal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tier, setTier] = useState<'free' | 'paid'>('free');
  const [isSubscribed, setIsSubscribed] = useState<boolean | null>(null); // null = checking, true/false = known state
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0); // Trigger to refresh signal after pattern save
  const toast = useToast();


  // Check subscription status only once when session changes
  useEffect(() => {
    if (session?.user) {
      checkSubscriptionStatus();
    } else {
      setIsSubscribed(false);
    }
  }, [(session?.user as SessionUser)?.id || session?.user?.email]); // Only depend on user ID or email, not tier

  // Check user subscription first, then fetch signal
  useEffect(() => {
    async function initializeData() {
      // First check subscription status and get the result
      const subscriptionStatus = await checkUserSubscription();
      // Then fetch signal with the subscription status
      await fetchSignal(subscriptionStatus);
    }
    
    initializeData();
  }, [(session?.user as SessionUser)?.id || session?.user?.email, refreshTrigger]); // Refresh when pattern is saved

  async function checkUserSubscription(): Promise<{ hasSubscription: boolean; isAdmin: boolean; tier: 'free' | 'paid' }> {
    if (session?.user) {
      try {
        // Try to fetch paid tier data - if successful, user has subscription or is admin
        const response = await fetch('/api/signal?tier=paid', {
          cache: 'no-store',
        });
        if (response.ok) {
          const data = await response.json();
          setHasActiveSubscription(true);
          // Only update tier if it's currently free (avoid infinite loop)
          setTier((currentTier) => currentTier === 'free' ? 'paid' : currentTier);
          return { hasSubscription: true, isAdmin: data.isAdmin || false, tier: 'paid' };
        } else {
          const errorData = await response.json().catch(() => ({}));
          console.log('Paid tier access denied:', errorData.error || response.status);
          setHasActiveSubscription(false);
          setTier('free');
          return { hasSubscription: false, isAdmin: false, tier: 'free' };
        }
      } catch (err) {
        console.error('Error checking subscription:', err);
        setHasActiveSubscription(false);
        setTier('free');
        return { hasSubscription: false, isAdmin: false, tier: 'free' };
      }
    } else {
      setHasActiveSubscription(false);
      setTier('free');
      return { hasSubscription: false, isAdmin: false, tier: 'free' };
    }
  }

  async function checkSubscriptionStatus() {
    // Set to checking state first
    setIsSubscribed(null);
    
    if ('serviceWorker' in navigator) {
      try {
        const subscribed = await isSubscribedToPushNotifications();
        console.log('Current subscription status:', subscribed);
        
        // Also check notification permission
        if ('Notification' in window) {
          console.log('Notification permission:', Notification.permission);
        }
        
        setIsSubscribed(subscribed);
      } catch (error) {
        console.error('Error checking subscription status:', error);
        setIsSubscribed(false);
      }
    } else {
      // Service Worker not supported
      setIsSubscribed(false);
    }
  }


  async function fetchSignal(subscriptionStatus?: { hasSubscription: boolean; isAdmin: boolean; tier: 'free' | 'paid' }) {
    setLoading(true);
    setError(null);
    try {
      // Check online status
      if (!navigator.onLine) {
        throw new Error('You are currently offline. Please check your internet connection.');
      }

      // Add minimum loading time for better UX
      // This ensures users see the skeleton UI even on fast connections
      const minLoadingTime = 800; // 800ms minimum
      const startTime = Date.now();
      
      // Use subscription status if provided, otherwise use state
      const hasSub = subscriptionStatus?.hasSubscription ?? hasActiveSubscription;
      const userTier = subscriptionStatus?.tier ?? tier;
      const userIsAdmin = subscriptionStatus?.isAdmin ?? false;
      
      // If user has subscription or is admin, always fetch paid tier
      const actualTier = hasSub || userIsAdmin ? 'paid' : userTier;
      
      let response = await fetch(`/api/signal?tier=${actualTier}`, {
        cache: 'no-store',
      });
      
      // If paid tier fails (no subscription), fall back to free tier
      if (!response.ok && actualTier === 'paid') {
        console.log('Paid tier not available, falling back to free tier');
        response = await fetch('/api/signal?tier=free', {
          cache: 'no-store',
        });
        // Update state if paid tier access was denied
        if (response.ok) {
          setHasActiveSubscription(false);
          setTier('free');
        }
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || 'Failed to fetch signal';
        
        // If it's a 404 (no data), show a helpful message instead of error
        if (response.status === 404) {
          setSignal({
            week_start: new Date().toISOString().split('T')[0],
            overall_status: 'ok',
            risk_count: 0,
            explanation: 'Signal data is being prepared. Please check back soon.',
            explanation_type: 'basic',
            indicators: [],
          });
          setLoading(false);
          return;
        }
        
        throw new Error(errorMessage);
      }
      const data = await response.json();
      
      // Debug: Log API response
      console.log('Signal API Response:', {
        hasImpactAnalysis: !!data.impactAnalysis,
        impactAnalysis: data.impactAnalysis,
        tier: subscriptionStatus?.tier || tier,
      });
      
      // If user is admin, automatically set tier to paid and subscription status
      if (data.isAdmin) {
        setTier('paid');
        setHasActiveSubscription(true);
      }
      
      // Ensure minimum loading time for better UX
      const elapsed = Date.now() - startTime;
      if (elapsed < minLoadingTime) {
        await new Promise(resolve => setTimeout(resolve, minLoadingTime - elapsed));
      }
      
      setSignal(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      
      // Show toast for network errors
      if (errorMessage.includes('offline') || errorMessage.includes('Failed to fetch')) {
        toast.error('Connection issue. Please check your internet and try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  async function fetchHistory() {
    // Only fetch history if user has active subscription or is admin
    if (!hasActiveSubscription && tier !== 'paid') return;
    
    setHistoryLoading(true);
    try {
      const response = await fetch(`/api/history?limit=12`, {
        cache: 'no-store',
      });
      if (!response.ok) {
        throw new Error('Failed to fetch history');
      }
      const data = await response.json();
      setHistory(data.signals || []);
    } catch (err) {
      console.error('Error fetching history:', err);
      toast.error('Failed to load history. Please try again.');
    } finally {
      setHistoryLoading(false);
    }
  }

  useEffect(() => {
    if ((hasActiveSubscription || tier === 'paid') && showHistory) {
      fetchHistory();
    }
  }, [hasActiveSubscription, tier, showHistory]);

  function formatDate(dateString: string): string {
    // week_start is always a Monday (YYYY-MM-DD format)
    // Parse as local date to avoid timezone issues
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day); // month is 0-indexed
    // Ensure it's displayed as Monday (week_start is always Monday)
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
    try {
      if (!('serviceWorker' in navigator)) {
        toast.error('Your browser does not support service workers. Please use a modern browser like Chrome, Firefox, or Edge.');
        return;
      }

      if (!('Notification' in window)) {
        toast.error('Your browser does not support notifications.');
        return;
      }

      // Check notification permission
      if (Notification.permission !== 'granted') {
        // Permission should already be granted by handleNotificationClick, but check just in case
        console.warn('Notification permission not granted, but proceeding...');
      }

      // Check VAPID key
      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidKey) {
        console.error('VAPID public key not found');
        toast.error('Push notification configuration error. Please contact support.');
        return;
      }

      // Register service worker first
      console.log('Registering service worker...');
      let registration;
      try {
        registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered:', registration);
      } catch (error) {
        console.error('Service Worker registration failed:', error);
        toast.error('Failed to register service worker. Please refresh the page and try again.');
        return;
      }

      // Wait for service worker to be ready
      await navigator.serviceWorker.ready;
      console.log('Service Worker is ready');

      // Subscribe to push notifications (permission is already granted)
      console.log('Subscribing to push notifications...');
      const subscription = await subscribeToPushNotifications();
      
      if (subscription) {
        setIsSubscribed(true);
        console.log('✅ Push notification subscription successful');
        toast.success('Notifications enabled! You\'ll receive weekly economic signals every Monday.');
        
        // Automatically send a test notification after successful subscription
        console.log('Sending test notification to verify setup...');
        try {
          const testResponse = await fetch('/api/push/test', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              endpoint: subscription.endpoint,
            }),
          });

          if (testResponse.ok) {
            console.log('✅ Test notification sent successfully');
            toast.info('Test notification sent! Check your browser notifications.');
          } else {
            console.warn('⚠️ Test notification failed, but subscription is active');
          }
        } catch (testError) {
          console.warn('⚠️ Could not send test notification:', testError);
          // Don't show error to user - subscription is still successful
        }
      } else {
        console.error('Failed to subscribe to push notifications');
        toast.error('Failed to enable notifications. Please check your browser notification settings and try again.');
      }
    } catch (error) {
      console.error('Error in handleSubscribe:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Provide more specific error messages
      let userMessage = '❌ Failed to enable notifications.';
      if (errorMessage.includes('permission')) {
        userMessage = '❌ Notification permission required. Please allow notifications in your browser settings.';
      } else if (errorMessage.includes('VAPID')) {
        userMessage = '❌ Push notification configuration error: VAPID key missing. Please contact support.';
      } else if (errorMessage.includes('Service Worker')) {
        userMessage = '❌ Your browser does not support Service Workers. Please use Chrome, Firefox, or Edge.';
      } else if (errorMessage.includes('push subscription')) {
        userMessage = '❌ Failed to create push subscription. Please allow notifications in browser settings and try again.';
      } else {
        userMessage = `Error: ${errorMessage}`;
      }
      
      toast.error(userMessage);
    }
  }

  async function handleUnsubscribe() {
    const success = await unsubscribeFromPushNotifications();
    if (success) {
      setIsSubscribed(false);
      toast.info('Notifications disabled.');
    } else {
      toast.error('Failed to disable notifications.');
    }
  }



  // Show loading state if:
  // 1. Initial data is loading
  // 2. Session is still loading
  // 3. Signal data is not available yet
  const isLoading = loading || status === 'loading' || !signal;
  
  // Simple Loading Component (Google Style)
  if (isLoading) {
    return (
      <>
        <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />
        <WelcomeModal />
        <Header
          hasActiveSubscription={hasActiveSubscription}
          isSubscribed={isSubscribed}
          onNotificationClick={handleNotificationClick}
        />

        {/* Simple Loading Spinner (Google Style) */}
        <main className="min-h-screen flex items-center justify-center p-4 md:p-8">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 dark:border-gray-600 border-t-blue-600 dark:border-t-blue-400 mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Loading signal data...
            </p>
          </div>
        </main>
      </>
    );
  }

  // User-friendly error messages
  const getErrorMessage = (error: string): { title: string; message: string; suggestion: string } => {
    if (error.includes('offline') || error.includes('Failed to fetch') || error.includes('network')) {
      return {
        title: 'Connection Issue',
        message: 'Unable to connect to the server.',
        suggestion: 'Please check your internet connection and try again. You can also try refreshing the page.'
      };
    }
    if (error.includes('404') || error.includes('No signal data') || error.includes('not ready')) {
      return {
        title: 'No Data Available',
        message: 'Signal data is not ready yet.',
        suggestion: 'Please try again later. Data is updated every Monday at 9 AM Eastern Time.'
      };
    }
    if (error.includes('401') || error.includes('Authentication')) {
      return {
        title: 'Authentication Required',
        message: 'You need to sign in to use this feature.',
        suggestion: 'Please sign in and try again. If you don\'t have an account, you can sign up for free.'
      };
    }
    if (error.includes('403') || error.includes('subscription')) {
      return {
        title: 'Subscription Required',
        message: 'This feature requires an active subscription.',
        suggestion: 'Please upgrade to a paid plan to access this feature. You can preview features before subscribing.'
      };
    }
    if (error.includes('500') || error.includes('Server')) {
      return {
        title: 'Server Error',
        message: 'A server error occurred.',
        suggestion: 'Please try again later. If the problem persists, please contact support through your account settings.'
      };
    }
    return {
      title: 'Error Occurred',
      message: 'An error occurred while loading data.',
      suggestion: 'Please refresh the page or try again later. If the problem continues, contact support.'
    };
  };

  if (error) {
    const errorInfo = getErrorMessage(error);
    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
          <div className="mb-6">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              {errorInfo.title}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {errorInfo.message}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              {errorInfo.suggestion}
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => fetchSignal()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-label="Retry fetching signal data"
            >
              Try Again
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              aria-label="Refresh the page"
            >
              Refresh Page
            </button>
            {typeof window !== 'undefined' && !navigator.onLine && (
              <div className="mt-2 px-4 py-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg" role="alert">
                <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                  ⚠️ You appear to be offline. Please check your internet connection.
                </p>
              </div>
            )}
          </div>
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

  async function handleNotificationClick() {
    // If still checking, wait a bit or show loading
    if (isSubscribed === null) {
      toast.info('Checking notification status...');
      return;
    }

    if (isSubscribed) {
      // Open notification settings page
      window.location.href = '/account/notifications';
      return;
    }

    // Check if notification permission is already granted
    if ('Notification' in window && Notification.permission === 'granted') {
      // Permission already granted, proceed with subscription
      handleSubscribe();
      return;
    }

    // Permission not granted yet, request it first
    if (!('Notification' in window)) {
      toast.error('Your browser does not support notifications.');
      return;
    }

    if (Notification.permission === 'denied') {
      toast.error('Notification permission denied. Please enable notifications in your browser settings.');
      return;
    }

    // Request permission first (this will show browser popup immediately)
    try {
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        // Permission granted, now proceed with subscription
        toast.info('Permission granted! Setting up notifications...');
        handleSubscribe();
      } else if (permission === 'denied') {
        toast.error('Notification permission denied. Please allow notifications in your browser settings.');
      } else {
        toast.warning('Notification permission request was canceled. Please try again to enable notifications.');
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      toast.error('An error occurred while requesting notification permission.');
    }
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            name: 'Cost Signal',
            description: 'Weekly economic signal for U.S. consumers. Get notified every Monday with a clear signal (OK, CAUTION, or RISK) based on official government data.',
            url: 'https://cost-signal.com',
            applicationCategory: 'FinanceApplication',
            operatingSystem: 'Web',
            offers: {
              '@type': 'Offer',
              price: '4.99',
              priceCurrency: 'USD',
              availability: 'https://schema.org/InStock',
            },
            aggregateRating: {
              '@type': 'AggregateRating',
              ratingValue: '4.5',
              ratingCount: '1',
            },
          }),
        }}
      />
      <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />
      <WelcomeModal />
      <Header
        hasActiveSubscription={hasActiveSubscription}
        isSubscribed={isSubscribed}
        onNotificationClick={handleNotificationClick}
      />

      <main className="min-h-screen p-6 md:p-12 bg-gray-50 dark:bg-black">
        <div className="w-full mx-auto px-4 md:px-8 max-w-7xl">
        {/* Welcome Message (for guests) */}
        {!session?.user && (
          <div className="mb-8 text-center">
            <div className="inline-block px-4 py-2.5 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                👋 <strong>Welcome!</strong> You can browse for free. <Link href="/signup" className="underline font-medium hover:text-blue-900 dark:hover:text-blue-100 transition-colors">Sign up</Link> for full features.
              </p>
            </div>
          </div>
        )}

        {/* Main Signal Card */}
        {signal && (
          <SignalCard
            signal={signal}
            tier={tier}
            session={session}
            hasActiveSubscription={hasActiveSubscription}
            onPreviewClick={async () => {
              setTier('paid');
              await fetchSignal();
            }}
            formatDate={formatDate}
            formatValue={formatValue}
          />
        )}

        {/* Average User Impact Analysis & History Section (Paid tier only) */}
        {tier === 'paid' && signal && signal.impactAnalysis && (
          <>
            {/* Average User Cost Impact Banner */}
            <Card className="mb-10 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/10 dark:via-indigo-900/10 dark:to-purple-900/10 border border-blue-200/60 dark:border-blue-800/40">
              <div className="flex items-start gap-5 py-6">
                <div className="text-5xl flex-shrink-0">📊</div>
                <div className="flex-1">
                  <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3 tracking-tight">
                    Average U.S. Consumer Cost Impact
                  </h3>
                  <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                    This analysis is based on average U.S. consumer spending patterns (weekly gas fill-up, $1,500 monthly rent, mixed eating habits, car transport).
                  </p>
                </div>
              </div>
            </Card>
            
            {/* ROI Summary */}
            <div className="mb-12">
              <ROISummary
                insights={signal.impactAnalysis.insights}
                savingsOpportunities={signal.impactAnalysis.savingsOpportunities}
              />
            </div>
            
            {/* Impact Breakdown */}
            <div className="mb-12">
              <ImpactBreakdown
                totalWeeklyChange={signal.impactAnalysis.totalWeeklyChange}
                breakdown={signal.impactAnalysis.breakdown}
              />
            </div>
            
            {/* Divider */}
            <div className="my-16 border-t border-gray-200/60 dark:border-gray-700/60"></div>
            
            {/* Actionable Insights */}
            {signal.impactAnalysis.insights && signal.impactAnalysis.insights.length > 0 && (
              <div className="mb-12">
                <ActionableInsights insights={signal.impactAnalysis.insights} />
              </div>
            )}
            
            {/* Predictions */}
            {signal.impactAnalysis.predictions && signal.impactAnalysis.predictions.length > 0 && (
              <div className="mb-12">
                <Predictions predictions={signal.impactAnalysis.predictions} />
              </div>
            )}
            
            {/* Savings Opportunities */}
            {signal.impactAnalysis.savingsOpportunities && signal.impactAnalysis.savingsOpportunities.length > 0 && (
              <div className="mb-12">
                <SavingsOpportunities opportunities={signal.impactAnalysis.savingsOpportunities} />
              </div>
            )}
            
            {/* Trust Badge */}
            <div className="mb-12">
              <TrustBadge />
            </div>
          </>
        )}

        {/* History Section - Full width below */}
        <div className="mt-8">
          <HistorySection
            history={history}
            showHistory={showHistory}
            onToggle={() => setShowHistory(!showHistory)}
            formatDate={formatDate}
            isLoading={historyLoading}
          />
        </div>

        <Footer />
      </div>
    </main>
    </>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}

