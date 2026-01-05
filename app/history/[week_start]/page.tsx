'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { SignalCard } from '@/components/SignalCard';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useToast, ToastContainer } from '@/components/Toast';
import type { SessionUser } from '@/lib/types';

interface Signal {
  week_start: string;
  overall_status: 'ok' | 'caution' | 'risk';
  risk_count: number;
  explanation?: string | null;
  explanation_type?: 'basic' | 'detailed';
  isAdmin?: boolean;
  indicators?: Array<{
    type: string;
    value?: number;
    previous_value?: number | null;
    change_percent?: number | null;
    status: 'ok' | 'caution' | 'risk';
    locked?: boolean;
  }>;
}

export default function HistoryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const weekStart = params?.week_start as string;
  const toast = useToast();
  
  const [signal, setSignal] = useState<Signal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tier, setTier] = useState<'free' | 'paid'>('free');
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);

  useEffect(() => {
    if (weekStart) {
      checkUserSubscription();
    }
  }, [weekStart, session]);

  async function checkUserSubscription() {
    if (session?.user) {
      try {
        const response = await fetch('/api/signal?tier=paid', {
          cache: 'no-store',
        });
        if (response.ok) {
          const data = await response.json();
          setHasActiveSubscription(true);
          setTier('paid');
          await fetchSignal({ hasSubscription: true, isAdmin: data.isAdmin || false, tier: 'paid' });
        } else {
          setHasActiveSubscription(false);
          setTier('free');
          await fetchSignal({ hasSubscription: false, isAdmin: false, tier: 'free' });
        }
      } catch (err) {
        console.error('Error checking subscription:', err);
        setHasActiveSubscription(false);
        setTier('free');
        await fetchSignal({ hasSubscription: false, isAdmin: false, tier: 'free' });
      }
    } else {
      setHasActiveSubscription(false);
      setTier('free');
      await fetchSignal({ hasSubscription: false, isAdmin: false, tier: 'free' });
    }
  }

  async function fetchSignal(subscriptionStatus: { hasSubscription: boolean; isAdmin: boolean; tier: 'free' | 'paid' }) {
    setLoading(true);
    setError(null);
    try {
      if (!navigator.onLine) {
        throw new Error('You are currently offline. Please check your internet connection.');
      }

      const actualTier = subscriptionStatus.hasSubscription || subscriptionStatus.isAdmin ? 'paid' : subscriptionStatus.tier;
      
      let response = await fetch(`/api/signal?tier=${actualTier}&week_start=${weekStart}`, {
        cache: 'no-store',
      });
      
      if (!response.ok && actualTier === 'paid') {
        response = await fetch(`/api/signal?tier=free&week_start=${weekStart}`, {
          cache: 'no-store',
        });
        if (response.ok) {
          setHasActiveSubscription(false);
          setTier('free');
        }
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch signal');
      }
      
      const data = await response.json();
      
      if (data.isAdmin) {
        setTier('paid');
        setHasActiveSubscription(true);
      }
      
      setSignal(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      
      if (errorMessage.includes('offline') || errorMessage.includes('Failed to fetch')) {
        toast.error('Connection issue. Please check your internet and try again.');
      }
    } finally {
      setLoading(false);
    }
  }

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

  if (loading) {
    return (
      <>
        <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />
        <Header
          hasActiveSubscription={hasActiveSubscription}
          isSubscribed={false}
          onNotificationClick={() => {}}
        />
        <main className="min-h-screen flex items-center justify-center p-4 md:p-8">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 dark:border-gray-600 border-t-blue-600 dark:border-t-blue-400 mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Loading signal data...
            </p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />
        <Header
          hasActiveSubscription={hasActiveSubscription}
          isSubscribed={false}
          onNotificationClick={() => {}}
        />
        <main className="min-h-screen flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
            <div className="mb-6">
              <div className="text-6xl mb-4">⚠️</div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Error
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {error}
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => router.back()}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Go Back
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!signal) {
    return (
      <>
        <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />
        <Header
          hasActiveSubscription={hasActiveSubscription}
          isSubscribed={false}
          onNotificationClick={() => {}}
        />
        <main className="min-h-screen flex items-center justify-center p-4">
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400">No signal data available for this week.</p>
            <button
              onClick={() => router.back()}
              className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Go Back
            </button>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />
      <Header
        hasActiveSubscription={hasActiveSubscription}
        isSubscribed={false}
        onNotificationClick={() => {}}
      />
      <main className="min-h-screen p-4 md:p-8 max-w-4xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="text-blue-600 dark:text-blue-400 hover:underline mb-4 inline-flex items-center gap-2"
          >
            ← Back to History
          </button>
        </div>
        
        {signal && (
          <SignalCard
            signal={signal}
            tier={tier}
            session={session}
            hasActiveSubscription={hasActiveSubscription}
            onPreviewClick={async () => {
              setTier('paid');
              await fetchSignal({ hasSubscription: true, isAdmin: false, tier: 'paid' });
            }}
            formatDate={formatDate}
            formatValue={formatValue}
          />
        )}
      </main>
      <Footer />
    </>
  );
}

