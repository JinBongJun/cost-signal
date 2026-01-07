'use client';

// Utility: Convert VAPID public key from URL-safe base64 string to Uint8Array
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

  const rawData =
    typeof window !== 'undefined'
      ? window.atob(base64)
      : Buffer.from(base64, 'base64').toString('binary');
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Check if user is already subscribed to push notifications
 */
export async function isSubscribedToPushNotifications(): Promise<boolean> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration || !registration.pushManager) return false;

    const subscription = await registration.pushManager.getSubscription();
    return !!subscription;
  } catch (error) {
    console.error('Error checking push subscription:', error);
    return false;
  }
}

/**
 * Subscribe to push notifications and register subscription with backend
 */
export async function subscribeToPushNotifications(): Promise<PushSubscription | null> {
  if (
    typeof window === 'undefined' ||
    !('serviceWorker' in navigator) ||
    !(window as any).PushManager
  ) {
    console.warn('Push notifications are not supported in this environment.');
    return null;
  }

  try {
    // Ensure service worker is registered and ready
    const registration = await navigator.serviceWorker.ready;

    const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!vapidKey) {
      console.error(
        'VAPID public key not found. Set NEXT_PUBLIC_VAPID_PUBLIC_KEY in your environment.'
      );
      return null;
    }

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      // Cast to any to satisfy TypeScript's BufferSource requirement in different lib versions
      applicationServerKey: urlBase64ToUint8Array(vapidKey) as any,
    });

    // Register subscription with backend
    try {
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscription),
      });
    } catch (error) {
      console.error('Error registering push subscription with backend:', error);
      // Even if backend registration fails, keep browser subscription so user can try again later
    }

    return subscription;
  } catch (error) {
    console.error('Error subscribing to push notifications:', error);
    return null;
  }
}

/**
 * Unsubscribe from push notifications and remove subscription from backend
 */
export async function unsubscribeFromPushNotifications(): Promise<boolean> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration || !registration.pushManager) return false;

    const subscription = await registration.pushManager.getSubscription();
    if (!subscription) {
      return true;
    }

    const endpoint = subscription.endpoint;

    const unsubscribed = await subscription.unsubscribe();

    if (unsubscribed && endpoint) {
      try {
        await fetch(`/api/push/subscribe?endpoint=${encodeURIComponent(endpoint)}`, {
          method: 'DELETE',
        });
      } catch (error) {
        console.error('Error removing push subscription from backend:', error);
      }
    }

    return unsubscribed;
  } catch (error) {
    console.error('Error unsubscribing from push notifications:', error);
    return false;
  }
}


