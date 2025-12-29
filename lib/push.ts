import webpush from 'web-push';
import { getDb } from './db';

// VAPID keys - generate these once and store in .env
// Run: npx web-push generate-vapid-keys
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
const vapidEmail = process.env.VAPID_EMAIL || 'mailto:your-email@example.com';

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(
    vapidEmail,
    vapidPublicKey,
    vapidPrivateKey
  );
}

export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  data?: any;
}

/**
 * Send push notification to a single subscription
 */
export async function sendPushNotification(
  subscription: { endpoint: string; keys: { p256dh: string; auth: string } },
  payload: PushNotificationPayload
): Promise<boolean> {
  try {
    if (!vapidPublicKey || !vapidPrivateKey) {
      console.error('❌ VAPID keys not configured');
      return false;
    }

    console.log('📤 Sending push notification to:', subscription.endpoint.substring(0, 50) + '...');
    console.log('📝 Payload:', payload.title);

    await webpush.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
        },
      },
      JSON.stringify(payload)
    );

    console.log('✅ Push notification sent successfully');
    return true;
  } catch (error: any) {
    // If subscription is invalid, we should remove it
    if (error.statusCode === 410 || error.statusCode === 404) {
      const db = getDb();
      await db.deletePushSubscription(subscription.endpoint);
      console.log('🗑️ Removed invalid subscription:', subscription.endpoint);
    } else {
      console.error('❌ Error sending push notification:', error);
      console.error('Error details:', {
        statusCode: error.statusCode,
        message: error.message,
        body: error.body,
      });
    }
    return false;
  }
}

/**
 * Send weekly signal notification to all subscribers
 * This should be called after weekly data update
 */
export async function sendWeeklySignalNotification(): Promise<{ sent: number; failed: number }> {
  const db = getDb();
  const signal = await db.getLatestWeeklySignal();
  const subscriptions = await db.getAllPushSubscriptions();

  if (!signal) {
    console.log('No signal data available for notification');
    return { sent: 0, failed: 0 };
  }

  if (subscriptions.length === 0) {
    console.log('No push subscriptions found');
    return { sent: 0, failed: 0 };
  }

  // Determine emoji and status text
  const statusEmoji = {
    ok: '🟢',
    caution: '🟡',
    risk: '🔴',
  }[signal.overall_status];

  const statusText = {
    ok: 'OK',
    caution: 'CAUTION',
    risk: 'RISK',
  }[signal.overall_status];

  const payload: PushNotificationPayload = {
    title: `Cost Signal: ${statusEmoji} ${statusText}`,
    body: signal.explanation || `This week's economic signal is ${statusText.toLowerCase()}.`,
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    data: {
      url: '/',
      week_start: signal.week_start,
    },
  };

  let sent = 0;
  let failed = 0;

  // Send to all subscriptions
  for (const sub of subscriptions) {
    const success = await sendPushNotification(
      {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.p256dh,
          auth: sub.auth,
        },
      },
      payload
    );

    if (success) {
      sent++;
    } else {
      failed++;
    }
  }

  console.log(`Weekly notification sent: ${sent} successful, ${failed} failed`);
  return { sent, failed };
}

