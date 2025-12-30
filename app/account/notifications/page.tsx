'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { useToast, ToastContainer } from '@/components/Toast';
import { Header } from '@/components/Header';

export default function NotificationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [browserSupported, setBrowserSupported] = useState(true);
  const toast = useToast();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?redirect=/account/notifications');
      return;
    }

    if (session?.user) {
      checkSubscriptionStatus();
    }
  }, [session, status, router]);

  async function checkSubscriptionStatus() {
    setLoading(true);
    try {
      if (!('serviceWorker' in navigator) || !('Notification' in window)) {
        setBrowserSupported(false);
        setIsSubscribed(false);
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      setIsSubscribed(!!subscription);
    } catch (error) {
      console.error('Error checking subscription status:', error);
      setIsSubscribed(false);
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleNotifications() {
    if (!browserSupported) {
      toast.error('Your browser does not support push notifications.');
      return;
    }

    setToggling(true);
    try {
      if (isSubscribed) {
        // Unsubscribe
        await handleUnsubscribe();
      } else {
        // Subscribe
        await handleSubscribe();
      }
    } catch (error) {
      console.error('Error toggling notifications:', error);
      toast.error('Failed to update notification settings. Please try again.');
    } finally {
      setToggling(false);
    }
  }

  async function handleSubscribe() {
    try {
      if (!('serviceWorker' in navigator)) {
        toast.error('Your browser does not support service workers.');
        return;
      }

      if (!('Notification' in window)) {
        toast.error('Your browser does not support notifications.');
        return;
      }

      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidKey) {
        toast.error('Push notification configuration error. Please contact support.');
        return;
      }

      // Register service worker
      let registration;
      try {
        registration = await navigator.serviceWorker.register('/sw.js');
      } catch (error) {
        console.error('Service Worker registration failed:', error);
        toast.error('Failed to register service worker. Please refresh the page and try again.');
        return;
      }

      await navigator.serviceWorker.ready;

      // Request notification permission
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        toast.error('Notification permission denied. Please enable notifications in your browser settings.');
        return;
      }

      // Subscribe to push notifications
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidKey,
      });

      // Send subscription to server
      const response = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          endpoint: subscription.endpoint,
          keys: {
            p256dh: arrayBufferToBase64(subscription.getKey('p256dh')!),
            auth: arrayBufferToBase64(subscription.getKey('auth')!),
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save subscription');
      }

      setIsSubscribed(true);
      toast.success('Notifications enabled successfully!');
    } catch (error) {
      console.error('Error subscribing to notifications:', error);
      toast.error('Failed to enable notifications. Please try again.');
      throw error;
    }
  }

  async function handleUnsubscribe() {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        // Unsubscribe from push service
        await subscription.unsubscribe();

        // Remove from server
        const response = await fetch(`/api/push/subscribe?endpoint=${encodeURIComponent(subscription.endpoint)}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          console.warn('Failed to remove subscription from server');
        }
      }

      setIsSubscribed(false);
      toast.success('Notifications disabled successfully.');
    } catch (error) {
      console.error('Error unsubscribing from notifications:', error);
      toast.error('Failed to disable notifications. Please try again.');
      throw error;
    }
  }

  function arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  if (status === 'loading' || loading) {
    return (
      <>
        <Header />
        <main className="min-h-screen p-4 md:p-8 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse space-y-6">
              <div className="h-8 w-48 bg-gray-300 dark:bg-gray-700 rounded"></div>
              <div className="h-64 bg-gray-300 dark:bg-gray-700 rounded-lg"></div>
            </div>
          </div>
        </main>
      </>
    );
  }

  if (!session?.user) {
    return null; // Will redirect
  }

  return (
    <>
      <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />
      <Header />
      <main className="min-h-screen p-4 md:p-8 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Link href="/account">
              <Button variant="ghost" size="sm">
                ← Back to Account
              </Button>
            </Link>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold mb-8">Notification Settings</h1>

          <Card className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Push Notifications</h2>
            
            {!browserSupported ? (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                  Your browser does not support push notifications. Please use a modern browser like Chrome, Firefox, or Edge.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                      Weekly Signal Notifications
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Receive notifications when new weekly economic signals are available (every Monday at 9 AM ET).
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-sm font-medium ${isSubscribed ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                      {isSubscribed ? 'Enabled' : 'Disabled'}
                    </span>
                    <button
                      onClick={handleToggleNotifications}
                      disabled={toggling}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                        isSubscribed ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                      } ${toggling ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                      role="switch"
                      aria-checked={isSubscribed}
                      aria-label="Toggle notifications"
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          isSubscribed ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {isSubscribed && (
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                    <p className="text-green-800 dark:text-green-200 text-sm">
                      ✓ You will receive notifications every Monday when new economic signals are available.
                    </p>
                  </div>
                )}

                {!isSubscribed && (
                  <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      Enable notifications to stay updated on weekly economic signals without visiting the website.
                    </p>
                  </div>
                )}
              </div>
            )}
          </Card>

          <Card>
            <h2 className="text-xl font-semibold mb-4">About Notifications</h2>
            <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
              <p>
                <strong className="text-gray-900 dark:text-gray-100">When you'll receive notifications:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Every Monday at 9 AM Eastern Time (when new weekly signals are published)</li>
                <li>Only if you have notifications enabled</li>
              </ul>
              <p className="pt-2">
                <strong className="text-gray-900 dark:text-gray-100">Notification content:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Overall signal status (OK, CAUTION, or RISK)</li>
                <li>Brief summary of the week's economic indicators</li>
              </ul>
              <p className="pt-2">
                <strong className="text-gray-900 dark:text-gray-100">Privacy:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Notifications are sent directly from our servers</li>
                <li>We don't share your subscription data with third parties</li>
                <li>You can disable notifications at any time</li>
              </ul>
            </div>
          </Card>
        </div>
      </main>
    </>
  );
}

