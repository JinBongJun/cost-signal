// Script to add push event handlers to the service worker after build
// This will be run after next-pwa generates the service worker

const fs = require('fs');
const path = require('path');

const swPath = path.join(__dirname, '../public/sw.js');

const pushHandlerCode = `
// Push notification event handlers (injected by add-push-handlers.js)
self.addEventListener('push', function(event) {
  console.log('[Service Worker] Push event received:', event);

  let notificationData = {
    title: 'Cost Signal',
    body: 'You have a new notification',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: 'cost-signal-notification',
    requireInteraction: false,
    data: {
      url: '/',
    },
  };

  if (event.data) {
    try {
      const data = event.data.json();
      notificationData = {
        title: data.title || notificationData.title,
        body: data.body || notificationData.body,
        icon: data.icon || notificationData.icon,
        badge: data.badge || notificationData.badge,
        tag: data.tag || notificationData.tag,
        requireInteraction: data.requireInteraction || false,
        data: data.data || notificationData.data,
      };
    } catch (e) {
      console.error('[Service Worker] Error parsing push data:', e);
    }
  }

  const promiseChain = self.registration.showNotification(
    notificationData.title,
    {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      tag: notificationData.tag,
      requireInteraction: notificationData.requireInteraction,
      data: notificationData.data,
    }
  );

  event.waitUntil(promiseChain);
});

self.addEventListener('notificationclick', function(event) {
  console.log('[Service Worker] Notification click received:', event);
  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients
      .matchAll({
        type: 'window',
        includeUncontrolled: true,
      })
      .then(function(clientList) {
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});
`;

if (fs.existsSync(swPath)) {
  let swContent = fs.readFileSync(swPath, 'utf8');
  
  // Check if push handlers are already added
  if (!swContent.includes('Push event received')) {
    // Add push handlers at the end of the file
    swContent += pushHandlerCode;
    fs.writeFileSync(swPath, swContent, 'utf8');
    console.log('✅ Push event handlers added to service worker');
  } else {
    console.log('ℹ️ Push event handlers already exist in service worker');
  }
} else {
  console.warn('⚠️ Service worker file not found:', swPath);
}

