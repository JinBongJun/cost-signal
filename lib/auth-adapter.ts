/**
 * NextAuth adapter for SQLite
 * Cost optimization: Custom adapter to avoid additional dependencies
 */

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
      // This would require a join, simplified for now
      // In production, you'd want to implement this properly
      return null;
    },

    async updateUser(user: Partial<AdapterUser> & { id: string }) {
      await db.updateUser(user.id, {
        email: user.email,
        name: user.name,
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
      // Implement account linking
      const { promisify } = require('util');
      const run = promisify(db['db'].run.bind(db['db']));
      await run(
        `INSERT INTO accounts (id, user_id, type, provider, provider_account_id, refresh_token, access_token, expires_at, token_type, scope, id_token, session_state)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          crypto.randomUUID(),
          account.userId,
          account.type,
          account.provider,
          account.providerAccountId,
          account.refresh_token || null,
          account.access_token || null,
          account.expires_at || null,
          account.token_type || null,
          account.scope || null,
          account.id_token || null,
          account.session_state || null,
        ]
      );
      return account;
    },

    async createSession({ sessionToken, userId, expires }) {
      const { promisify } = require('util');
      const run = promisify(db['db'].run.bind(db['db']));
      const id = crypto.randomUUID();
      await run(
        `INSERT INTO sessions (id, session_token, user_id, expires) VALUES (?, ?, ?, ?)`,
        [id, sessionToken, userId, expires.getTime()]
      );
      return { sessionToken, userId, expires } as AdapterSession;
    },

    async getSessionAndUser(sessionToken: string) {
      const { promisify } = require('util');
      const get = promisify(db['db'].get.bind(db['db']));
      const session = await get(`SELECT * FROM sessions WHERE session_token = ?`, [sessionToken]);
      if (!session) return null;
      
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
      const { promisify } = require('util');
      const run = promisify(db['db'].run.bind(db['db']));
      if (data.expires) {
        await run(`UPDATE sessions SET expires = ? WHERE session_token = ?`, [data.expires.getTime(), sessionToken]);
      }
      const get = promisify(db['db'].get.bind(db['db']));
      const session = await get(`SELECT * FROM sessions WHERE session_token = ?`, [sessionToken]);
      if (!session) return null;
      return {
        sessionToken: session.session_token,
        userId: session.user_id,
        expires: new Date(session.expires),
      } as AdapterSession;
    },

    async deleteSession(sessionToken: string) {
      const { promisify } = require('util');
      const run = promisify(db['db'].run.bind(db['db']));
      await run(`DELETE FROM sessions WHERE session_token = ?`, [sessionToken]);
    },

    async createVerificationToken({ identifier, token, expires }) {
      const { promisify } = require('util');
      const run = promisify(db['db'].run.bind(db['db']));
      await run(
        `INSERT INTO verification_tokens (identifier, token, expires) VALUES (?, ?, ?)`,
        [identifier, token, expires.getTime()]
      );
      return { identifier, token, expires };
    },

    async useVerificationToken({ identifier, token }) {
      const { promisify } = require('util');
      const get = promisify(db['db'].get.bind(db['db']));
      const run = promisify(db['db'].run.bind(db['db']));
      const vt = await get(
        `SELECT * FROM verification_tokens WHERE identifier = ? AND token = ?`,
        [identifier, token]
      );
      if (!vt) return null;
      await run(`DELETE FROM verification_tokens WHERE identifier = ? AND token = ?`, [identifier, token]);
      return {
        identifier: vt.identifier,
        token: vt.token,
        expires: new Date(vt.expires),
      };
    },
  };
}


