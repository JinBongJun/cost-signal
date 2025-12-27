/**
 * Retry utility for API calls
 * Cost optimization: Automatic retry reduces manual intervention
 */

export async function retry<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    delay?: number;
    onRetry?: (error: Error, attempt: number) => void;
  } = {}
): Promise<T> {
  const { maxRetries = 3, delay = 1000, onRetry } = options;

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (onRetry) {
        onRetry(lastError, attempt);
      }

      // Don't retry on last attempt
      if (attempt < maxRetries) {
        // Exponential backoff
        const waitTime = delay * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }

  throw lastError || new Error('Retry failed');
}

/**
 * Retry with exponential backoff for API calls
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3
): Promise<T> {
  return retry(fn, {
    maxRetries,
    delay: 1000,
    onRetry: (error, attempt) => {
      console.log(`Retry attempt ${attempt}/${maxRetries} after error:`, error.message);
    },
  });
}


