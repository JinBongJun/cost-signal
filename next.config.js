const withPWA = require('@ducanh2912/next-pwa').default({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: false, // Enable in both dev and production for push notifications
  sw: 'sw.js', // Use our custom service worker
  workboxOptions: {
    // Inject custom code after workbox initialization
    runtimeCaching: [],
  },
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
}

module.exports = withPWA(nextConfig)

