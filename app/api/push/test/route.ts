import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { sendPushNotification } from '@/lib/push';

/**
 * POST /api/push/test
 * Send a test push notification to the current user's subscription
 * (For testing purposes - should be protected in production)
 */
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { endpoint } = body;

    if (!endpoint) {
      return NextResponse.json(
        { error: 'Endpoint required' },
        { status: 400 }
      );
    }

    const db = getDb();
    const subscriptions = await db.getAllPushSubscriptions();
    
    // Find the subscription matching the endpoint
    const subscription = subscriptions.find(sub => sub.endpoint === endpoint);

    if (!subscription) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      );
    }

    // Send test notification
    const success = await sendPushNotification(
      {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.p256dh,
          auth: subscription.auth,
        },
      },
      {
        title: '✅ 테스트 알림',
        body: '푸시 알림이 정상적으로 작동합니다! 매주 월요일에 경제 신호를 받게 됩니다.',
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        data: {
          url: '/',
        },
      }
    );

    if (success) {
      return NextResponse.json({ 
        success: true, 
        message: 'Test notification sent successfully' 
      });
    } else {
      return NextResponse.json(
        { error: 'Failed to send notification' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error sending test notification:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

