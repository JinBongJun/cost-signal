const packageJson = require('./package.json');
const { execSync } = require('child_process');

// Get git commit hash (short version)
function getGitCommitHash() {
  try {
    return execSync('git rev-parse --short HEAD', { encoding: 'utf-8' }).trim();
  } catch (e) {
    return 'dev';
  }
}

// Get git commit date
function getGitCommitDate() {
  try {
    return execSync('git log -1 --format=%ci', { encoding: 'utf-8' }).trim();
  } catch (e) {
    return new Date().toISOString();
  }
}

const gitCommitHash = getGitCommitHash();
const gitCommitDate = getGitCommitDate();

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_APP_VERSION: `${packageJson.version}-${gitCommitHash}`,
    NEXT_PUBLIC_BUILD_TIME: new Date().toISOString(),
    NEXT_PUBLIC_GIT_COMMIT: gitCommitHash,
    NEXT_PUBLIC_GIT_COMMIT_DATE: gitCommitDate,
  },
}

// Conditionally wrap with PWA if available
let config = nextConfig;
try {
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
  });
  config = withPWA(nextConfig);
} catch (e) {
  // @ducanh2912/next-pwa not installed, skip PWA configuration
  console.log('PWA not configured, skipping...');
}

// Conditionally wrap with Sentry if available
try {
  const { withSentryConfig } = require('@sentry/nextjs');
  if (process.env.SENTRY_ORG && process.env.SENTRY_PROJECT) {
    config = withSentryConfig(
      config,
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
        webpack: {
          treeshake: {
            removeDebugLogging: true,
          },
          automaticVercelMonitors: true,
        },
      }
    );
  }
} catch (e) {
  // @sentry/nextjs not installed, skip Sentry configuration
  console.log('Sentry not configured, skipping...');
}

module.exports = config;

