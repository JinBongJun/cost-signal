import { supabase } from './supabase';

export interface IndicatorData {
  id: number;
  week_start: string; // ISO date string (Monday of the week)
  indicator_type: 'gas' | 'cpi' | 'interest_rate' | 'unemployment';
  value: number;
  previous_value: number | null;
  change_percent: number | null;
  status: 'ok' | 'caution' | 'risk';
  created_at: string;
}

export interface WeeklySignal {
  id: number;
  week_start: string;
  overall_status: 'ok' | 'caution' | 'risk';
  risk_count: number;
  explanation: string | null;
  created_at: string;
}

export interface PushSubscription {
  id: number;
  endpoint: string;
  p256dh: string;
  auth: string;
  user_agent: string | null;
  created_at: string;
}

class Database {
  async getLatestIndicator(type: 'gas' | 'cpi' | 'interest_rate' | 'unemployment'): Promise<IndicatorData | null> {
    const { data, error } = await supabase
      .from('indicators')
      .select('*')
      .eq('indicator_type', type)
      .order('week_start', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) return null;

    return {
      ...data,
      created_at: data.created_at ? new Date(data.created_at).toISOString() : new Date().toISOString(),
    } as IndicatorData;
  }

  async getLatestWeeklySignal(): Promise<WeeklySignal | null> {
    // Use created_at for reliable sorting (most recent first)
    // Fallback to id if created_at is not available
    const { data, error } = await supabase
      .from('weekly_signals')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Supabase error in getLatestWeeklySignal:', error);
      return null;
    }

    if (!data || data.length === 0) {
      console.log('No weekly signals found in database');
      return null;
    }

    const signal = data[0];
    return {
      ...signal,
      created_at: signal.created_at ? new Date(signal.created_at).toISOString() : new Date().toISOString(),
    } as WeeklySignal;
  }

  async getWeeklySignal(weekStart: string): Promise<WeeklySignal | null> {
    const { data, error } = await supabase
      .from('weekly_signals')
      .select('*')
      .eq('week_start', weekStart)
      .single();

    if (error || !data) return null;

    return {
      ...data,
      created_at: data.created_at ? new Date(data.created_at).toISOString() : new Date().toISOString(),
    } as WeeklySignal;
  }

  async getIndicatorsForWeek(weekStart: string): Promise<IndicatorData[]> {
    const { data, error } = await supabase
      .from('indicators')
      .select('*')
      .eq('week_start', weekStart)
      .order('indicator_type', { ascending: true });

    if (error || !data) return [];

    return data.map(item => ({
      ...item,
      created_at: item.created_at ? new Date(item.created_at).toISOString() : new Date().toISOString(),
    })) as IndicatorData[];
  }

  async saveIndicator(data: Omit<IndicatorData, 'id' | 'created_at'>): Promise<void> {
    const { error } = await supabase
      .from('indicators')
      .upsert({
        week_start: data.week_start,
        indicator_type: data.indicator_type,
        value: data.value,
        previous_value: data.previous_value,
        change_percent: data.change_percent,
        status: data.status,
      }, {
        onConflict: 'week_start,indicator_type',
      });

    if (error) {
      throw new Error(`Failed to save indicator: ${error.message}`);
    }
  }

  async saveWeeklySignal(data: Omit<WeeklySignal, 'id' | 'created_at'>): Promise<void> {
    const { error } = await supabase
      .from('weekly_signals')
      .upsert({
        week_start: data.week_start,
        overall_status: data.overall_status,
        risk_count: data.risk_count,
        explanation: data.explanation,
      }, {
        onConflict: 'week_start',
      });

    if (error) {
      throw new Error(`Failed to save weekly signal: ${error.message}`);
    }
  }

  async getRecentIndicators(type: 'gas' | 'cpi' | 'interest_rate' | 'unemployment', weeks: number = 4): Promise<IndicatorData[]> {
    const { data, error } = await supabase
      .from('indicators')
      .select('*')
      .eq('indicator_type', type)
      .order('week_start', { ascending: false })
      .limit(weeks);

    if (error || !data) return [];

    return data.map(item => ({
      ...item,
      created_at: item.created_at ? new Date(item.created_at).toISOString() : new Date().toISOString(),
    })) as IndicatorData[];
  }

  async getWeeklySignalsHistory(limit: number = 12): Promise<WeeklySignal[]> {
    const { data, error } = await supabase
      .from('weekly_signals')
      .select('*')
      .order('week_start', { ascending: false })
      .limit(limit);

    if (error || !data) return [];

    return data.map(item => ({
      ...item,
      created_at: item.created_at ? new Date(item.created_at).toISOString() : new Date().toISOString(),
    })) as WeeklySignal[];
  }

  async savePushSubscription(subscription: Omit<PushSubscription, 'id' | 'created_at'>): Promise<void> {
    const { error } = await supabase
      .from('push_subscriptions')
      .upsert({
        endpoint: subscription.endpoint,
        p256dh: subscription.p256dh,
        auth: subscription.auth,
        user_agent: subscription.user_agent,
      }, {
        onConflict: 'endpoint',
      });

    if (error) {
      throw new Error(`Failed to save push subscription: ${error.message}`);
    }
  }

  async getAllPushSubscriptions(): Promise<PushSubscription[]> {
    const { data, error } = await supabase
      .from('push_subscriptions')
      .select('*');

    if (error || !data) return [];

    return data.map(item => ({
      ...item,
      created_at: item.created_at ? new Date(item.created_at).toISOString() : new Date().toISOString(),
    })) as PushSubscription[];
  }

  async deletePushSubscription(endpoint: string): Promise<void> {
    const { error } = await supabase
      .from('push_subscriptions')
      .delete()
      .eq('endpoint', endpoint);

    if (error) {
      throw new Error(`Failed to delete push subscription: ${error.message}`);
    }
  }

  // User and subscription methods
  async getUserById(userId: string): Promise<any | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !data) return null;

    // Convert email_verified from timestamp to Date if needed
    if (data.email_verified) {
      data.emailVerified = new Date(data.email_verified);
    }

    return data;
  }

  async getUserByEmail(email: string): Promise<any | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !data) return null;

    // Convert email_verified from timestamp to Date if needed
    if (data.email_verified) {
      data.emailVerified = new Date(data.email_verified);
    }

    return data;
  }

  async createUser(user: { id: string; email: string; name?: string; emailVerified?: Date; password?: string }): Promise<void> {
    const { error } = await supabase
      .from('users')
      .insert({
        id: user.id,
        email: user.email,
        name: user.name || null,
        email_verified: user.emailVerified ? user.emailVerified.toISOString() : null,
        password: user.password || null,
      });

    if (error) {
      throw new Error(`Failed to create user: ${error.message}`);
    }
  }

  async updateUser(userId: string, updates: { email?: string; name?: string; emailVerified?: Date }): Promise<void> {
    const updateData: any = {};

    if (updates.email) updateData.email = updates.email;
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.emailVerified !== undefined) {
      updateData.email_verified = updates.emailVerified.toISOString();
    }

    const { error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId);

    if (error) {
      throw new Error(`Failed to update user: ${error.message}`);
    }
  }

  async getAccountByProvider(provider: string, providerAccountId: string): Promise<any | null> {
    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .eq('provider', provider)
      .eq('provider_account_id', providerAccountId)
      .single();

    if (error || !data) return null;
    return data;
  }

  async linkAccount(account: {
    id: string;
    userId: string;
    type: string;
    provider: string;
    providerAccountId: string;
    access_token?: string;
    expires_at?: number;
    token_type?: string;
    scope?: string;
    id_token?: string;
  }): Promise<void> {
    const { error } = await supabase
      .from('accounts')
      .insert({
        id: account.id,
        user_id: account.userId,
        type: account.type,
        provider: account.provider,
        provider_account_id: account.providerAccountId,
        access_token: account.access_token || null,
        expires_at: account.expires_at || null,
        token_type: account.token_type || null,
        scope: account.scope || null,
        id_token: account.id_token || null,
      });

    if (error) {
      throw new Error(`Failed to link account: ${error.message}`);
    }
  }

  async getSubscriptionByUserId(userId: string): Promise<any | null> {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) return null;
    return data;
  }

  async getSubscriptionByStripeId(stripeSubscriptionId: string): Promise<any | null> {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('stripe_subscription_id', stripeSubscriptionId)
      .single();

    if (error || !data) return null;
    return data;
  }

  async saveSubscription(subscription: {
    id?: string;
    user_id: string;
    stripe_subscription_id: string;
    stripe_customer_id: string;
    status: string;
    plan: string;
    current_period_start: number;
    current_period_end: number;
    cancel_at_period_end?: boolean;
  }): Promise<void> {
    const subscriptionData: any = {
      user_id: subscription.user_id,
      stripe_subscription_id: subscription.stripe_subscription_id,
      stripe_customer_id: subscription.stripe_customer_id,
      status: subscription.status,
      plan: subscription.plan,
      current_period_start: subscription.current_period_start,
      current_period_end: subscription.current_period_end,
      cancel_at_period_end: subscription.cancel_at_period_end ? 1 : 0,
    };

    if (subscription.id) {
      // Update existing
      const { error } = await supabase
        .from('subscriptions')
        .update(subscriptionData)
        .eq('id', subscription.id);

      if (error) {
        throw new Error(`Failed to update subscription: ${error.message}`);
      }
    } else {
      // Insert new
      const { error } = await supabase
        .from('subscriptions')
        .insert(subscriptionData);

      if (error) {
        throw new Error(`Failed to create subscription: ${error.message}`);
      }
    }
  }

  close() {
    // Supabase client doesn't need explicit closing
    return Promise.resolve();
  }
}

// Singleton instance
let dbInstance: Database | null = null;

export function getDb(): Database {
  if (!dbInstance) {
    dbInstance = new Database();
  }
  return dbInstance;
}
