/**
 * Environment variable validation utilities
 * Ensures all required environment variables are set at startup
 */

/**
 * Get a required environment variable or throw an error
 * @param key - Environment variable key
 * @param defaultValue - Optional default value (for development only)
 * @returns The environment variable value
 * @throws Error if variable is not set and no default is provided
 */
export function requireEnv(key: string, defaultValue?: string): string {
  const value = process.env[key] || defaultValue;
  
  if (!value) {
    const error = new Error(
      `Missing required environment variable: ${key}\n` +
      `Please set ${key} in your .env file or environment variables.`
    );
    
    // In production, log to console; in development, throw immediately
    if (process.env.NODE_ENV === 'production') {
      console.error(error.message);
      // Don't throw in production to avoid breaking the app
      // Instead, return empty string and let the calling code handle it
      return '';
    }
    
    throw error;
  }
  
  return value;
}

/**
 * Get an optional environment variable
 * @param key - Environment variable key
 * @param defaultValue - Default value if not set
 * @returns The environment variable value or default
 */
export function getEnv(key: string, defaultValue: string = ''): string {
  return process.env[key] || defaultValue;
}

/**
 * Validate all required environment variables at startup
 * Call this function early in the application lifecycle
 */
export function validateRequiredEnv(): void {
  const requiredVars: string[] = [];
  
  // Core authentication
  if (!process.env.NEXTAUTH_SECRET) {
    requiredVars.push('NEXTAUTH_SECRET');
  }
  if (!process.env.NEXTAUTH_URL && process.env.NODE_ENV === 'production') {
    requiredVars.push('NEXTAUTH_URL');
  }
  
  // Database
  if (!process.env.SUPABASE_URL) {
    requiredVars.push('SUPABASE_URL');
  }
  if (!process.env.SUPABASE_ANON_KEY) {
    requiredVars.push('SUPABASE_ANON_KEY');
  }
  
  // API Keys
  if (!process.env.OPENAI_API_KEY) {
    requiredVars.push('OPENAI_API_KEY');
  }
  if (!process.env.EIA_API_KEY) {
    requiredVars.push('EIA_API_KEY');
  }
  if (!process.env.FRED_API_KEY) {
    requiredVars.push('FRED_API_KEY');
  }
  
  // Payment (Paddle)
  if (!process.env.PADDLE_API_KEY) {
    requiredVars.push('PADDLE_API_KEY');
  }
  if (!process.env.PADDLE_WEBHOOK_SECRET) {
    requiredVars.push('PADDLE_WEBHOOK_SECRET');
  }
  
  // Email (Resend)
  if (!process.env.RESEND_API_KEY) {
    requiredVars.push('RESEND_API_KEY');
  }
  if (!process.env.RESEND_FROM_EMAIL) {
    requiredVars.push('RESEND_FROM_EMAIL');
  }
  
  // Push Notifications
  if (!process.env.VAPID_PUBLIC_KEY) {
    requiredVars.push('VAPID_PUBLIC_KEY');
  }
  if (!process.env.VAPID_PRIVATE_KEY) {
    requiredVars.push('VAPID_PRIVATE_KEY');
  }
  if (!process.env.VAPID_EMAIL) {
    requiredVars.push('VAPID_EMAIL');
  }
  
  if (requiredVars.length > 0) {
    const errorMessage = 
      `Missing required environment variables:\n` +
      requiredVars.map(v => `  - ${v}`).join('\n') +
      `\n\nPlease set these variables in your .env file or environment variables.`;
    
    if (process.env.NODE_ENV === 'production') {
      console.error(errorMessage);
      // In production, log but don't throw to avoid breaking the app
    } else {
      console.warn(errorMessage);
      // In development, warn but continue (allows for partial testing)
    }
  }
}

/**
 * Validate environment variables for a specific feature
 * Useful for feature-specific validation
 */
export function validateFeatureEnv(feature: 'paddle' | 'email' | 'push' | 'auth'): boolean {
  switch (feature) {
    case 'paddle':
      return !!(process.env.PADDLE_API_KEY && process.env.PADDLE_WEBHOOK_SECRET);
    case 'email':
      return !!(process.env.RESEND_API_KEY && process.env.RESEND_FROM_EMAIL);
    case 'push':
      return !!(
        process.env.VAPID_PUBLIC_KEY &&
        process.env.VAPID_PRIVATE_KEY &&
        process.env.VAPID_EMAIL
      );
    case 'auth':
      return !!(process.env.NEXTAUTH_SECRET && process.env.NEXTAUTH_URL);
    default:
      return false;
  }
}

