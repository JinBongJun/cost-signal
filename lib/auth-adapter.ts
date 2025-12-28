/**
 * NextAuth adapter for Supabase
 */

import { supabase } from './supabase';
import { getDb } from './db';
import type { Adapter, AdapterUser, AdapterAccount, AdapterSession, VerificationToken } from 'next-auth/adapters';

export function SQLiteAdapter(): Adapter {
  const db = getDb();

  return {
    async createUser(user: Omit<AdapterUser, 'id'>) {
      const id = crypto.randomUUID();
      await db.createUser({
        id,
        email: user.email,
        name: user.name || undefined,
        emailVerified: user.emailVerified || undefined,
      });
      return { ...user, id } as AdapterUser;
    },

    async getUser(id: string) {
      const user = await db.getUserById(id);
      if (!user) return null;
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        emailVerified: user.emailVerified ? new Date(user.emailVerified) : null,
        image: user.image,
      } as AdapterUser;
    },

    async getUserByEmail(email: string) {
      const user = await db.getUserByEmail(email);
      if (!user) return null;
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        emailVerified: user.emailVerified ? new Date(user.emailVerified) : null,
        image: user.image,
      } as AdapterUser;
    },

    async getUserByAccount({ providerAccountId, provider }) {
      const { data: account, error } = await supabase
        .from('accounts')
        .select('user_id')
        .eq('provider', provider)
        .eq('provider_account_id', providerAccountId)
        .single();

      if (error || !account) return null;

      const user = await db.getUserById(account.user_id);
      if (!user) return null;

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        emailVerified: user.emailVerified ? new Date(user.emailVerified) : null,
        image: user.image,
      } as AdapterUser;
    },

    async updateUser(user: Partial<AdapterUser> & { id: string }) {
      await db.updateUser(user.id, {
        email: user.email,
        name: user.name || undefined,
        emailVerified: user.emailVerified || undefined,
      });
      const updated = await db.getUserById(user.id);
      if (!updated) throw new Error('User not found');
      return {
        id: updated.id,
        email: updated.email,
        name: updated.name,
        emailVerified: updated.emailVerified ? new Date(updated.emailVerified) : null,
        image: updated.image,
      } as AdapterUser;
    },

    async linkAccount(account: AdapterAccount) {
      const { error } = await supabase
        .from('accounts')
        .insert({
          id: crypto.randomUUID(),
          user_id: account.userId,
          type: account.type,
          provider: account.provider,
          provider_account_id: account.providerAccountId,
          refresh_token: account.refresh_token || null,
          access_token: account.access_token || null,
          expires_at: account.expires_at || null,
          token_type: account.token_type || null,
          scope: account.scope || null,
          id_token: account.id_token || null,
          session_state: account.session_state || null,
        });

      if (error) {
        throw new Error(`Failed to link account: ${error.message}`);
      }
      return account;
    },

    async createSession({ sessionToken, userId, expires }) {
      const { error } = await supabase
        .from('sessions')
        .insert({
          id: crypto.randomUUID(),
          session_token: sessionToken,
          user_id: userId,
          expires: expires.getTime(),
        });

      if (error) {
        throw new Error(`Failed to create session: ${error.message}`);
      }
      return { sessionToken, userId, expires } as AdapterSession;
    },

    async getSessionAndUser(sessionToken: string) {
      const { data: session, error: sessionError } = await supabase
        .from('sessions')
        .select('*')
        .eq('session_token', sessionToken)
        .single();

      if (sessionError || !session) return null;

      // Check if session is expired
      if (new Date(session.expires) < new Date()) {
        // Delete expired session
        await supabase.from('sessions').delete().eq('session_token', sessionToken);
        return null;
      }

      const user = await db.getUserById(session.user_id);
      if (!user) return null;

      return {
        session: {
          sessionToken: session.session_token,
          userId: session.user_id,
          expires: new Date(session.expires),
        } as AdapterSession,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          emailVerified: user.emailVerified ? new Date(user.emailVerified) : null,
          image: user.image,
        } as AdapterUser,
      };
    },

    async updateSession({ sessionToken, ...data }) {
      const updateData: any = {};
      if (data.expires) {
        updateData.expires = data.expires.getTime();
      }

      if (Object.keys(updateData).length > 0) {
        const { error } = await supabase
          .from('sessions')
          .update(updateData)
          .eq('session_token', sessionToken);

        if (error) {
          throw new Error(`Failed to update session: ${error.message}`);
        }
      }

      const { data: session, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('session_token', sessionToken)
        .single();

      if (error || !session) return null;

      return {
        sessionToken: session.session_token,
        userId: session.user_id,
        expires: new Date(session.expires),
      } as AdapterSession;
    },

    async deleteSession(sessionToken: string) {
      const { error } = await supabase
        .from('sessions')
        .delete()
        .eq('session_token', sessionToken);

      if (error) {
        throw new Error(`Failed to delete session: ${error.message}`);
      }
    },

    async createVerificationToken({ identifier, token, expires }) {
      const { error } = await supabase
        .from('verification_tokens')
        .insert({
          identifier,
          token,
          expires: expires.getTime(),
        });

      if (error) {
        throw new Error(`Failed to create verification token: ${error.message}`);
      }
      return { identifier, token, expires };
    },

    async useVerificationToken({ identifier, token }) {
      const { data: vt, error } = await supabase
        .from('verification_tokens')
        .select('*')
        .eq('identifier', identifier)
        .eq('token', token)
        .single();

      if (error || !vt) return null;

      // Delete the token after use
      await supabase
        .from('verification_tokens')
        .delete()
        .eq('identifier', identifier)
        .eq('token', token);

      return {
        identifier: vt.identifier,
        token: vt.token,
        expires: new Date(vt.expires),
      };
    },
  };
}



