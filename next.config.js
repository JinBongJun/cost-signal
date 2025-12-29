const { withSentryConfig } = require('@sentry/nextjs');

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
  // Enable Sentry instrumentation
  experimental: {
    instrumentationHook: true,
  },
}

// Wrap with PWA first, then Sentry
const configWithPWA = withPWA(nextConfig);

module.exports = withSentryConfig(
  configWithPWA,
  {
    // For all available options, see:
    // https://github.com/getsentry/sentry-webpack-plugin#options

    // Suppresses source map uploading logs during build
    silent: true,
    org: process.env.SENTRY_ORG,
    project: process.env.SENTRY_PROJECT,
    
    // Only upload source maps in production
    widenClientFileUpload: true,
    hideSourceMaps: true,
    disableLogger: true,
    automaticVercelMonitors: true,
  }
);

