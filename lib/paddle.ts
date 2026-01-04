/**
 * Paddle payment integration
 * Cost optimization: Server-side API calls only, no unnecessary requests
 */

const PADDLE_API_KEY = process.env.PADDLE_API_KEY;
const PADDLE_WEBHOOK_SECRET = process.env.PADDLE_WEBHOOK_SECRET;
const PADDLE_ENVIRONMENT = process.env.PADDLE_ENVIRONMENT || 'sandbox'; // sandbox or production

export interface PaddlePrice {
  id: string;
  product_id: string;
  description: string;
  type: 'recurring';
  billing_cycle: {
    interval: 'month' | 'year';
    frequency: number;
  };
  trial_days?: number;
  quantity?: {
    minimum: number;
    maximum: number;
  };
  unit_price: {
    amount: string;
    currency_code: string;
  };
}

export interface PaddleSubscription {
  id: string;
  status: 'active' | 'canceled' | 'past_due' | 'paused';
  customer_id: string;
  current_billing_period: {
    starts_at: string;
    ends_at: string;
  };
  items: Array<{
    price_id: string;
    quantity: number;
  }>;
}

/**
 * Create a checkout session for subscription
 */
export async function createCheckoutSession(
  customerId: string,
  priceId: string,
  successUrl: string,
  cancelUrl: string
): Promise<{ url: string } | null> {
  if (!PADDLE_API_KEY) {
    console.error('PADDLE_API_KEY not configured');
    return null;
  }

  try {
    const response = await fetch('https://api.paddle.com/transactions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PADDLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        items: [
          {
            price_id: priceId,
            quantity: 1,
          },
        ],
        customer_id: customerId,
        custom_data: {
          user_id: customerId,
        },
        return_url: successUrl,
      }),
    });

    if (!response.ok) {
      throw new Error(`Paddle API error: ${response.status}`);
    }

    const data = await response.json();
    return { url: data.checkout?.url || data.url };
  } catch (error) {
    console.error('Error creating Paddle checkout:', error);
    return null;
  }
}

/**
 * Get subscription details
 */
export async function getSubscription(subscriptionId: string): Promise<PaddleSubscription | null> {
  if (!PADDLE_API_KEY) {
    return null;
  }

  try {
    const response = await fetch(`https://api.paddle.com/subscriptions/${subscriptionId}`, {
      headers: {
        'Authorization': `Bearer ${PADDLE_API_KEY}`,
      },
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching Paddle subscription:', error);
    return null;
  }
}

/**
 * Cancel subscription
 */
export async function cancelSubscription(subscriptionId: string): Promise<boolean> {
  if (!PADDLE_API_KEY) {
    return false;
  }

  try {
    const response = await fetch(`https://api.paddle.com/subscriptions/${subscriptionId}/cancel`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PADDLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        effective_from: 'next_billing_period', // Cancel at period end
      }),
    });

    return response.ok;
  } catch (error) {
    console.error('Error canceling Paddle subscription:', error);
    return false;
  }
}

/**
 * Resume subscription (reactivate canceled subscription)
 * This updates the subscription to remove the cancellation
 */
export async function resumeSubscription(subscriptionId: string): Promise<boolean> {
  if (!PADDLE_API_KEY) {
    return false;
  }

  try {
    // Paddle API: Update subscription to remove cancellation
    // We need to update the subscription to set cancel_at_period_end to false
    const response = await fetch(`https://api.paddle.com/subscriptions/${subscriptionId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${PADDLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        scheduled_change: null, // Remove scheduled cancellation
      }),
    });

    return response.ok;
  } catch (error) {
    console.error('Error resuming Paddle subscription:', error);
    return false;
  }
}

/**
 * Get payment transactions for a subscription
 */
export async function getTransactions(subscriptionId: string): Promise<any[]> {
  if (!PADDLE_API_KEY) {
    return [];
  }

  try {
    const response = await fetch(
      `https://api.paddle.com/transactions?subscription_id=${subscriptionId}&per_page=20`,
      {
        headers: {
          'Authorization': `Bearer ${PADDLE_API_KEY}`,
        },
      }
    );

    if (!response.ok) {
      console.error('Failed to fetch transactions:', response.status);
      return [];
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return [];
  }
}

/**
 * Refund a transaction
 * @param transactionId - Paddle transaction ID
 * @param amount - Optional amount to refund (partial refund). If not provided, full refund.
 * @param reason - Optional reason for refund
 * @returns true if refund was successful, false otherwise
 */
export async function refundTransaction(
  transactionId: string,
  amount?: number,
  reason?: string
): Promise<{ success: boolean; error?: string; refundId?: string }> {
  if (!PADDLE_API_KEY) {
    return { success: false, error: 'PADDLE_API_KEY not configured' };
  }

  try {
    const body: any = {};
    
    // Add amount if partial refund
    if (amount) {
      body.amount = {
        amount: amount.toString(),
        currency_code: 'USD',
      };
    }
    
    // Add reason if provided
    if (reason) {
      body.reason = reason;
    }

    const response = await fetch(
      `https://api.paddle.com/transactions/${transactionId}/refund`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${PADDLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return { 
        success: false, 
        error: errorData.error?.message || `Refund failed: ${response.status}` 
      };
    }

    const data = await response.json();
    return { success: true, refundId: data.id };
  } catch (error) {
    console.error('Error refunding transaction:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to process refund' 
    };
  }
}

/**
 * Get transaction details by ID
 */
export async function getTransaction(transactionId: string): Promise<any | null> {
  if (!PADDLE_API_KEY) {
    return null;
  }

  try {
    const response = await fetch(
      `https://api.paddle.com/transactions/${transactionId}`,
      {
        headers: {
          'Authorization': `Bearer ${PADDLE_API_KEY}`,
        },
      }
    );

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching transaction:', error);
    return null;
  }
}

/**
 * Verify Paddle webhook signature
 * 
 * Paddle webhook signature format:
 * - Header: Paddle-Signature
 * - Format: ts=<timestamp>;h1=<signature>
 * - Verification: HMAC-SHA256(ts:body, secret) === h1
 * 
 * Uses PADDLE_WEBHOOK_SECRET from environment if secret not provided
 * 
 * @param body - Raw request body as string
 * @param signature - Paddle-Signature header value
 * @param secret - Webhook secret key from Paddle dashboard (optional, uses env var if not provided)
 * @returns true if signature is valid, false otherwise
 */
export function verifyWebhookSignature(
  body: string,
  signature: string,
  secret?: string
): boolean {
  const webhookSecret = secret || PADDLE_WEBHOOK_SECRET;
  
  if (!webhookSecret) {
    console.error('PADDLE_WEBHOOK_SECRET not configured');
    return false;
  }
  
  return verifyWebhookSignatureInternal(body, signature, webhookSecret);
}

/**
 * Internal implementation of webhook signature verification
 */
function verifyWebhookSignatureInternal(
  body: string,
  signature: string,
  secret: string
): boolean {
  if (!signature || !secret || !body) {
    console.error('Missing required parameters for signature verification');
    return false;
  }

  try {
    // Parse Paddle-Signature header
    // Format: ts=<timestamp>;h1=<signature>
    const signatureParts: Record<string, string> = {};
    signature.split(';').forEach((part) => {
      const [key, value] = part.split('=');
      if (key && value) {
        signatureParts[key.trim()] = value.trim();
      }
    });

    const timestamp = signatureParts.ts;
    const providedSignature = signatureParts.h1;

    if (!timestamp || !providedSignature) {
      console.error('Invalid signature format: missing ts or h1');
      return false;
    }

    // Check timestamp to prevent replay attacks (5 minutes tolerance)
    const requestTime = parseInt(timestamp, 10);
    const currentTime = Math.floor(Date.now() / 1000);
    const timeDifference = Math.abs(currentTime - requestTime);
    const maxAge = 5 * 60; // 5 minutes in seconds

    if (timeDifference > maxAge) {
      console.error(`Signature timestamp too old or too far in future: ${timeDifference}s difference`);
      return false;
    }

    // Create signed payload: timestamp:body
    const signedPayload = `${timestamp}:${body}`;

    // Generate HMAC-SHA256 signature
    const crypto = require('crypto');
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(signedPayload);
    const computedSignature = hmac.digest('hex');

    // Use timing-safe comparison to prevent timing attacks
    const providedBuffer = Buffer.from(providedSignature, 'hex');
    const computedBuffer = Buffer.from(computedSignature, 'hex');

    // Check if buffers have the same length
    if (providedBuffer.length !== computedBuffer.length) {
      return false;
    }

    // Use crypto.timingSafeEqual for constant-time comparison
    return crypto.timingSafeEqual(providedBuffer, computedBuffer);
  } catch (error) {
    console.error('Error verifying Paddle webhook signature:', error);
    return false;
  }
}





