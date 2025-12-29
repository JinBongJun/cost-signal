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
    status: 'ok' | 'caution' | 'risk';
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
      
      // Try to fetch paid tier data first if tier is 'paid'
      // Use preview mode if user doesn't have subscription (or not logged in)
      const isPreviewMode = tier === 'paid' && (!session?.user || !hasActiveSubscription);
      let response = await fetch(`/api/signal?tier=${tier}${isPreviewMode ? '&preview=true' : ''}`, {
        cache: 'no-store', // Prevent caching for testing
      });
      
      // If paid tier fails (no subscription), fall back to preview mode
      if (!response.ok && tier === 'paid' && !isPreviewMode) {
        console.log('Paid tier not available, trying preview mode');
        response = await fetch('/api/signal?tier=paid&preview=true', {
          cache: 'no-store',
        });
      }
      
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
      // Use preview mode if user doesn't have subscription (or not logged in)
      const isPreviewMode = !session?.user || !hasActiveSubscription;
      const response = await fetch(`/api/history?limit=12${isPreviewMode ? '&preview=true' : ''}`);
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
    try {
      if (!('serviceWorker' in navigator)) {
        alert('❌ Your browser does not support service workers. Please use a modern browser like Chrome, Firefox, or Edge.');
        return;
      }

      if (!('Notification' in window)) {
        alert('❌ Your browser does not support notifications.');
        return;
      }

      // Check VAPID key
      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidKey) {
        console.error('VAPID public key not found');
        alert('❌ Push notification configuration error. Please contact support.');
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
        alert('❌ Failed to register service worker. Please refresh the page and try again.');
        return;
      }

      // Wait for service worker to be ready
      await navigator.serviceWorker.ready;
      console.log('Service Worker is ready');

      // Subscribe to push notifications
      console.log('Subscribing to push notifications...');
      const subscription = await subscribeToPushNotifications();
      
      if (subscription) {
        setIsSubscribed(true);
        console.log('✅ Push notification subscription successful');
        alert('✅ Notifications enabled! You\'ll receive weekly economic signals every Monday.');
      } else {
        console.error('Failed to subscribe to push notifications');
        alert('❌ Failed to enable notifications. Please check your browser notification settings and try again.');
      }
    } catch (error) {
      console.error('Error in handleSubscribe:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Provide more specific error messages
      let userMessage = '❌ Failed to enable notifications.';
      if (errorMessage.includes('permission')) {
        userMessage = '❌ 알림 권한이 필요합니다. 브라우저 설정에서 알림을 허용해주세요.';
      } else if (errorMessage.includes('VAPID')) {
        userMessage = '❌ 푸시 알림 설정 오류: VAPID 키가 없습니다. 관리자에게 문의하세요.';
      } else if (errorMessage.includes('Service Worker')) {
        userMessage = '❌ 브라우저가 Service Worker를 지원하지 않습니다. Chrome, Firefox, Edge를 사용해주세요.';
      } else if (errorMessage.includes('push subscription')) {
        userMessage = '❌ 푸시 구독 생성 실패. 브라우저 설정에서 알림을 허용하고 다시 시도해주세요.';
      } else {
        userMessage = `❌ 오류: ${errorMessage}`;
      }
      
      alert(userMessage);
    }
  }

  async function handleUnsubscribe() {
    const success = await unsubscribeFromPushNotifications();
    if (success) {
      setIsSubscribed(false);
      alert('Notifications disabled.');
    }
  }

  async function handleTestNotification() {
    try {
      if (!('serviceWorker' in navigator)) {
        alert('❌ Service Worker를 지원하지 않는 브라우저입니다.');
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        alert('❌ 알림 구독을 찾을 수 없습니다. 알림을 다시 활성화해주세요.');
        return;
      }

      // Send test notification
      const response = await fetch('/api/push/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          endpoint: subscription.endpoint,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send test notification');
      }

      alert('✅ 테스트 알림을 보냈습니다! 잠시 후 알림이 표시됩니다.');
    } catch (error) {
      console.error('Error sending test notification:', error);
      alert(`❌ 테스트 알림 전송 실패: ${error instanceof Error ? error.message : 'Unknown error'}`);
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

  // User-friendly error messages
  const getErrorMessage = (error: string): { title: string; message: string; suggestion: string } => {
    if (error.includes('Failed to fetch') || error.includes('network')) {
      return {
        title: '연결 문제',
        message: '인터넷 연결을 확인할 수 없습니다.',
        suggestion: '인터넷 연결을 확인하고 다시 시도해주세요.'
      };
    }
    if (error.includes('404') || error.includes('No signal data')) {
      return {
        title: '데이터 없음',
        message: '아직 신호 데이터가 준비되지 않았습니다.',
        suggestion: '잠시 후 다시 시도해주세요. 데이터는 매주 월요일 업데이트됩니다.'
      };
    }
    if (error.includes('401') || error.includes('403')) {
      return {
        title: '인증 필요',
        message: '이 기능을 사용하려면 로그인이 필요합니다.',
        suggestion: '로그인 후 다시 시도해주세요.'
      };
    }
    if (error.includes('500')) {
      return {
        title: '서버 오류',
        message: '서버에 문제가 발생했습니다.',
        suggestion: '잠시 후 다시 시도해주세요. 문제가 계속되면 관리자에게 문의해주세요.'
      };
    }
    return {
      title: '오류 발생',
      message: '데이터를 불러오는 중 문제가 발생했습니다.',
      suggestion: '페이지를 새로고침하거나 잠시 후 다시 시도해주세요.'
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
              onClick={fetchSignal}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              다시 시도
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              페이지 새로고침
            </button>
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
          
          {/* PWA Install Instructions (if not installed and no prompt) */}
          {!isInstalled && !deferredPrompt && (
            <div className="text-center text-sm text-gray-600 dark:text-gray-400 mb-2">
              <p>💡 앱 설치: 주소창의 설치 아이콘을 클릭하거나</p>
              <p>모바일에서는 메뉴 → "홈 화면에 추가"</p>
            </div>
          )}
          
          {!isSubscribed ? (
            <button
              onClick={handleSubscribe}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              🔔 Enable Weekly Notifications
            </button>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="flex gap-2">
                <button
                  onClick={handleUnsubscribe}
                  className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
                >
                  🔕 Disable Notifications
                </button>
                <button
                  onClick={handleTestNotification}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  🧪 테스트 알림
                </button>
              </div>
              <div className="text-xs text-green-600 dark:text-green-400">
                ✅ 알림이 활성화되어 있습니다
              </div>
            </div>
          )}
          
          {/* Notification Permission Help */}
          {!isSubscribed && (
            <div className="text-center text-xs text-gray-500 dark:text-gray-500 mt-1">
              <p>⚠️ 알림 팝업이 안 뜨면 브라우저 설정에서 알림을 허용해주세요</p>
            </div>
          )}
          
          {/* Debug Info (only in development) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="text-xs text-gray-400 mt-2 text-center">
              <p>Debug: isSubscribed={String(isSubscribed)}, Permission={typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'N/A'}</p>
            </div>
          )}
        </div>

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
              <div className="flex gap-2">
                <button
                  onClick={async () => {
                    // Switch to paid tier for preview (frontend only)
                    setTier('paid');
                    // Fetch paid tier data (will show mock data if no subscription)
                    await fetchSignal();
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  미리보기: 유료 기능 보기
                </button>
                <Link
                  href="/pricing"
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm flex items-center"
                >
                  실제 구독하기
                </Link>
              </div>
            </div>
          )}

          {/* Individual Indicators (Paid tier only) */}
          {tier === 'paid' && (
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold mb-4">Indicator Details</h3>
              {signal.indicators && signal.indicators.length > 0 ? (
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
              ) : (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                    <strong>미리보기 모드:</strong> 개별 지표 상세 정보를 보려면 실제 구독이 필요합니다.
                  </p>
                  <Link
                    href="/pricing"
                    className="mt-3 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    구독하기
                  </Link>
                </div>
              )}
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

