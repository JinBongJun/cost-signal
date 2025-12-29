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
    alert('❌ Notification permission denied. Please allow notifications in your browser settings.');
    return false;
  }

  // Permission is 'default', need to request
  console.log('Requesting notification permission (this will show a browser popup)...');
  console.log('⚠️ If popup does not appear, check browser notification settings');
  
  try {
    // Note: Notification.requestPermission() must be called in response to user interaction
    // This function is called from a button click, so it should work
    const permission = await Notification.requestPermission();
    console.log('Notification permission result:', permission);
    
    if (permission === 'granted') {
      console.log('✅ Notification permission granted');
      return true;
    } else if (permission === 'denied') {
      console.error('❌ Notification permission denied by user');
      alert('❌ Notification permission denied. Please allow notifications in your browser settings.');
      return false;
    } else {
      console.error('❌ Notification permission dismissed (user closed popup)');
      alert('⚠️ Notification permission request was canceled. Please try again to receive notifications.');
      return false;
    }
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    alert('❌ An error occurred while requesting notification permission.');
    return false;
  }
}

export async function subscribeToPushNotifications(): Promise<PushSubscription | null> {
  if (!('serviceWorker' in navigator)) {
    const error = 'Service Worker not supported in this browser';
    console.error(error);
    throw new Error(error);
  }

  try {
    // Request notification permission
    console.log('Step 1: Requesting notification permission...');
    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) {
      const error = 'Notification permission was not granted';
      console.error(error);
      throw new Error(error);
    }
    console.log('✅ Step 1: Notification permission granted');

    // Wait for service worker to be ready
    console.log('Step 2: Waiting for service worker to be ready...');
    const registration = await navigator.serviceWorker.ready;
    console.log('✅ Step 2: Service worker is ready');

    // Check VAPID key
    console.log('Step 3: Checking VAPID key...');
    const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!vapidKey) {
      const error = 'VAPID public key not found in environment variables. Please check NEXT_PUBLIC_VAPID_PUBLIC_KEY in .env';
      console.error(error);
      throw new Error(error);
    }
    console.log('✅ Step 3: VAPID key found, length:', vapidKey.length);

    // Subscribe to push notifications
    console.log('Step 4: Subscribing to push notifications...');
    let subscription;
    try {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey) as BufferSource,
      });
      console.log('✅ Step 4: Push subscription created:', subscription.endpoint);
    } catch (subscribeError) {
      const error = `Failed to create push subscription: ${subscribeError instanceof Error ? subscribeError.message : 'Unknown error'}`;
      console.error('❌ Step 4:', error);
      throw new Error(error);
    }

    // Send subscription to server
    console.log('Step 5: Sending subscription to server...');
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
      const error = `Failed to save subscription to server: ${response.status} ${errorText}`;
      console.error('❌ Step 5:', error);
      throw new Error(error);
    }

    console.log('✅ Step 5: Subscription saved to server successfully');
    return subscription;
  } catch (error) {
    console.error('❌ Error subscribing to push notifications:', error);
    // Re-throw the error so the caller can handle it
    throw error;
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




