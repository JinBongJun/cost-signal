/**
 * Client-side push notification utilities
 */

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications');
    return false;
  }

  console.log('Current notification permission:', Notification.permission);

  if (Notification.permission === 'granted') {
    console.log('✅ Notification permission already granted');
    return true;
  }

  if (Notification.permission === 'denied') {
    console.error('❌ Notification permission denied. Please enable in browser settings.');
    alert('❌ 알림 권한이 거부되었습니다. 브라우저 설정에서 알림을 허용해주세요.');
    return false;
  }

  // Permission is 'default', need to request
  console.log('Requesting notification permission (this will show a browser popup)...');
  try {
    const permission = await Notification.requestPermission();
    console.log('Notification permission result:', permission);
    
    if (permission === 'granted') {
      console.log('✅ Notification permission granted');
      return true;
    } else if (permission === 'denied') {
      console.error('❌ Notification permission denied by user');
      alert('❌ 알림 권한이 거부되었습니다. 브라우저 설정에서 알림을 허용해주세요.');
      return false;
    } else {
      console.error('❌ Notification permission dismissed (user closed popup)');
      alert('⚠️ 알림 권한 요청이 취소되었습니다. 알림을 받으려면 다시 시도해주세요.');
      return false;
    }
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    alert('❌ 알림 권한 요청 중 오류가 발생했습니다.');
    return false;
  }
}

export async function subscribeToPushNotifications(): Promise<PushSubscription | null> {
  if (!('serviceWorker' in navigator)) {
    console.log('Service Worker not supported');
    return null;
  }

  try {
    // Request notification permission
    console.log('Requesting notification permission...');
    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) {
      console.error('Notification permission denied');
      return null;
    }
    console.log('Notification permission granted');

    // Register service worker
    const registration = await navigator.serviceWorker.ready;
    console.log('Service worker ready, subscribing to push...');

    // Check VAPID key
    const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!vapidKey) {
      console.error('VAPID public key not found in environment');
      return null;
    }
    console.log('VAPID key found, length:', vapidKey.length);

    // Subscribe to push notifications
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidKey) as BufferSource,
    });
    console.log('Push subscription created:', subscription.endpoint);

    // Send subscription to server
    console.log('Sending subscription to server...');
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
      const errorText = await response.text();
      console.error('Failed to save subscription:', response.status, errorText);
      throw new Error(`Failed to save subscription: ${response.status}`);
    }

    console.log('✅ Subscription saved to server successfully');
    return subscription;
  } catch (error) {
    console.error('Error subscribing to push notifications:', error);
    return null;
  }
}

export async function unsubscribeFromPushNotifications(): Promise<boolean> {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      return true; // Already unsubscribed
    }

    // Unsubscribe from push service
    await subscription.unsubscribe();

    // Remove from server
    await fetch(`/api/push/subscribe?endpoint=${encodeURIComponent(subscription.endpoint)}`, {
      method: 'DELETE',
    });

    return true;
  } catch (error) {
    console.error('Error unsubscribing from push notifications:', error);
    return false;
  }
}

export async function isSubscribedToPushNotifications(): Promise<boolean> {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    return subscription !== null;
  } catch (error) {
    return false;
  }
}

// Helper functions
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}




