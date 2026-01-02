try {
  const Sentry = require('@sentry/nextjs');
  
  Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: 1.0,
  
  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,
  
  // Session Replay is optional - remove if you don't need it
  // To enable Replay, install @sentry/replay package separately
  // replaysOnErrorSampleRate: 1.0,
  // replaysSessionSampleRate: 0.1,
  
  environment: process.env.NODE_ENV || 'development',
  
  // Filter out health check endpoints and other noise
  beforeSend(event, hint) {
    // Don't send events in development unless explicitly enabled
    if (process.env.NODE_ENV === 'development' && !process.env.SENTRY_ENABLE_IN_DEV) {
      return null;
    }
    
    // Filter out known non-critical errors
    if (event.exception) {
      const error = hint.originalException;
      if (error instanceof Error) {
        // Filter out network errors that are expected
        if (error.message.includes('Failed to fetch') || 
            error.message.includes('NetworkError') ||
            error.message.includes('Load failed')) {
          return null;
        }
      }
    }
    
    return event;
  },
  });
} catch (e) {
  // Sentry not available, skip initialization
  console.log('Sentry not configured, skipping client-side initialization...');
}

// Export empty object to make this a valid module
export {};

