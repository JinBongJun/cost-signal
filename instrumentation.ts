export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Validate environment variables on startup
    try {
      const { validateRequiredEnv } = await import('./lib/env');
      validateRequiredEnv();
    } catch (e) {
      // env validation not available, skip
    }
    
    // Load Sentry server config if available
    try {
      await import('./sentry.server.config');
    } catch (e) {
      // Sentry not available, skip
    }
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    // Load Sentry edge config if available
    try {
      await import('./sentry.edge.config');
    } catch (e) {
      // Sentry not available, skip
    }
  }
}


