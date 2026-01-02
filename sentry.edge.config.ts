try {
  const Sentry = require('@sentry/nextjs');
  
  Sentry.init({
    dsn: process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN,
    
    // Adjust this value in production, or use tracesSampler for greater control
    tracesSampleRate: 1.0,
    
    // Setting this option to true will print useful information to the console while you're setting up Sentry.
    debug: false,
    
    environment: process.env.NODE_ENV || 'development',
  });
} catch (e) {
  // Sentry not available, skip initialization
  console.log('Sentry not configured, skipping edge initialization...');
}

// Export empty object to make this a valid module
export {};



