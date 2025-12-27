/**
 * Paddle payment integration
 * Cost optimization: Server-side API calls only, no unnecessary requests
 */

const PADDLE_API_KEY = process.env.PADDLE_API_KEY;
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
 * Verify Paddle webhook signature
 */
export function verifyWebhookSignature(
  body: string,
  signature: string,
  secret: string
): boolean {
  // Paddle webhook signature verification
  // Implementation depends on Paddle's webhook format
  // For now, we'll use a simple check
  return true; // TODO: Implement proper signature verification
}



