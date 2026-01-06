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
    // Use week_start for reliable sorting (most recent week first)
    // This ensures we get the latest week's data, not the most recently created record
    const { data, error } = await supabase
      .from('weekly_signals')
      .select('*')
      .order('week_start', { ascending: false })
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

  async getWeeklySignalsHistory(limit: number = 12, excludeCurrentWeek: boolean = true): Promise<WeeklySignal[]> {
    const { getCurrentWeekStart } = await import('./utils');
    const currentWeekStart = excludeCurrentWeek ? getCurrentWeekStart() : null;
    
    let query = supabase
      .from('weekly_signals')
      .select('*')
      .order('week_start', { ascending: false });
    
    // Exclude current week if requested
    if (currentWeekStart) {
      query = query.neq('week_start', currentWeekStart);
    }
    
    const { data, error } = await query.limit(limit);

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

  async updateUser(userId: string, updates: { email?: string; name?: string; emailVerified?: Date; password?: string }): Promise<void> {
    const updateData: any = {};

    if (updates.email) updateData.email = updates.email;
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.emailVerified !== undefined) {
      updateData.email_verified = updates.emailVerified.toISOString();
    }
    if (updates.password) updateData.password = updates.password;

    const { error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId);

    if (error) {
      throw new Error(`Failed to update user: ${error.message}`);
    }
  }

  // Password reset token methods
  async createPasswordResetToken(userId: string, token: string, expiresAt: Date): Promise<void> {
    // Invalidate any existing tokens for this user
    await supabase
      .from('password_reset_tokens')
      .update({ used: true })
      .eq('user_id', userId)
      .eq('used', false);

    const { error } = await supabase
      .from('password_reset_tokens')
      .insert({
        user_id: userId,
        token,
        expires_at: expiresAt.toISOString(),
        used: false,
      });

    if (error) {
      throw new Error(`Failed to create password reset token: ${error.message}`);
    }
  }

  async getPasswordResetToken(token: string): Promise<{ userId: string; expiresAt: Date } | null> {
    const { data, error } = await supabase
      .from('password_reset_tokens')
      .select('user_id, expires_at, used')
      .eq('token', token)
      .eq('used', false)
      .single();

    if (error || !data) return null;

    const expiresAt = new Date(data.expires_at);
    if (expiresAt < new Date()) {
      // Token expired
      return null;
    }

    return {
      userId: data.user_id,
      expiresAt,
    };
  }

  async markPasswordResetTokenAsUsed(token: string): Promise<void> {
    const { error } = await supabase
      .from('password_reset_tokens')
      .update({ used: true })
      .eq('token', token);

    if (error) {
      throw new Error(`Failed to mark token as used: ${error.message}`);
    }
  }

  // Email change token methods
  async createEmailChangeToken(userId: string, newEmail: string, token: string, expiresAt: Date): Promise<void> {
    try {
      // Invalidate any existing tokens for this user
      const { error: updateError } = await supabase
        .from('email_change_tokens')
        .update({ used: true })
        .eq('user_id', userId)
        .eq('used', false);

      if (updateError && updateError.code !== 'PGRST116') { // PGRST116 = no rows updated, which is OK
        console.error('Error invalidating existing tokens:', updateError);
        // Continue anyway - not critical
      }

      const { error } = await supabase
        .from('email_change_tokens')
        .insert({
          user_id: userId,
          new_email: newEmail,
          token,
          expires_at: expiresAt.toISOString(),
          used: false,
        });

      if (error) {
        console.error('Supabase error creating email change token:', error);
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        console.error('Error details:', error.details);
        console.error('Error hint:', error.hint);
        
        // Check if it's a table not found error
        if (error.code === '42P01' || error.message?.includes('does not exist') || error.message?.includes('relation')) {
          throw new Error('Email change tokens table not found. Please run the database migration.');
        }
        
        // Check if it's an RLS policy error
        if (error.code === '42501' || error.message?.includes('permission denied') || error.message?.includes('policy')) {
          throw new Error('Database permission error. Please check Row Level Security policies.');
        }
        
        throw new Error(`Failed to create email change token: ${error.message}`);
      }
    } catch (error) {
      // Re-throw with more context if it's already our custom error
      if (error instanceof Error && error.message.includes('Email change tokens table')) {
        throw error;
      }
      // Otherwise wrap it
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to create email change token: ${errorMessage}`);
    }
  }

  async getEmailChangeToken(token: string): Promise<{ userId: string; newEmail: string; expiresAt: Date } | null> {
    const { data, error } = await supabase
      .from('email_change_tokens')
      .select('user_id, new_email, expires_at, used')
      .eq('token', token)
      .eq('used', false)
      .single();

    if (error || !data) return null;

    const expiresAt = new Date(data.expires_at);
    if (expiresAt < new Date()) {
      // Token expired
      return null;
    }

    return {
      userId: data.user_id,
      newEmail: data.new_email,
      expiresAt,
    };
  }

  async markEmailChangeTokenAsUsed(token: string): Promise<void> {
    const { error } = await supabase
      .from('email_change_tokens')
      .update({ used: true })
      .eq('token', token);

    if (error) {
      throw new Error(`Failed to mark token as used: ${error.message}`);
    }
  }

  async getAccountByProvider(provider: string, providerAccountId: string): Promise<any | null> {
    // Don't use inner join - it fails if user doesn't exist (orphaned account)
    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .eq('provider', provider)
      .eq('provider_account_id', providerAccountId)
      .single();

    if (error || !data) return null;
    
    // Verify that the user still exists (in case of orphaned accounts)
    const userExists = await this.getUserById(data.user_id);
    if (!userExists) {
      console.log('⚠️ Found orphaned account for provider:', provider, 'accountId:', providerAccountId);
      return null;
    }
    
    return data;
  }

  async getUserAccounts(userId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .eq('user_id', userId);

    if (error || !data) return [];
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

  async createFeedback(feedback: {
    type: 'bug' | 'feature' | 'general';
    subject: string;
    message: string;
    userEmail?: string;
  }): Promise<void> {
    const { error } = await supabase
      .from('feedback')
      .insert({
        type: feedback.type,
        subject: feedback.subject,
        message: feedback.message,
        user_email: feedback.userEmail || null,
        status: 'pending',
      });

    if (error) {
      throw new Error(`Failed to create feedback: ${error.message}`);
    }
  }

  // Spending pattern methods
  async getSpendingPattern(userId: string): Promise<{
    id: string;
    user_id: string;
    gas_frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly' | null;
    monthly_rent: number | null;
    food_ratio: 'low' | 'medium' | 'high' | null;
    transport_mode: 'car' | 'public' | 'mixed' | null;
    has_debt: boolean | null;
    created_at: string;
    updated_at: string;
  } | null> {
    const { data, error } = await supabase
      .from('user_spending_patterns')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error || !data) return null;

    return {
      ...data,
      created_at: data.created_at ? new Date(data.created_at).toISOString() : new Date().toISOString(),
      updated_at: data.updated_at ? new Date(data.updated_at).toISOString() : new Date().toISOString(),
    };
  }

  async saveSpendingPattern(
    userId: string,
    pattern: {
      gas_frequency?: 'daily' | 'weekly' | 'biweekly' | 'monthly' | null;
      monthly_rent?: number | null;
      food_ratio?: 'low' | 'medium' | 'high' | null;
      transport_mode?: 'car' | 'public' | 'mixed' | null;
      has_debt?: boolean | null;
    }
  ): Promise<void> {
    console.log('DB: Saving spending pattern for user:', userId);
    console.log('DB: Pattern data:', pattern);
    console.log('DB: Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'NOT SET');
    
    try {
      const { data, error } = await supabase
        .from('user_spending_patterns')
        .upsert({
          user_id: userId,
          gas_frequency: pattern.gas_frequency ?? null,
          monthly_rent: pattern.monthly_rent ?? null,
          food_ratio: pattern.food_ratio ?? null,
          transport_mode: pattern.transport_mode ?? null,
          has_debt: pattern.has_debt ?? null,
        }, {
          onConflict: 'user_id',
        });

      if (error) {
        console.error('DB: Supabase error saving spending pattern:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
          fullError: JSON.stringify(error, null, 2),
        });
        throw new Error(`Failed to save spending pattern: ${error.message} (Code: ${error.code || 'unknown'})`);
      }
      
      console.log('DB: Spending pattern saved successfully:', data);
    } catch (err) {
      console.error('DB: Exception in saveSpendingPattern:', err);
      throw err;
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
