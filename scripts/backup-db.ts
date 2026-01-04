/**
 * Database backup script
 * Creates a backup of the Supabase database by exporting key tables
 * 
 * Usage:
 *   npm run backup-db
 *   or
 *   ts-node scripts/backup-db.ts
 */

import { getDb } from '../lib/db';
import * as fs from 'fs';
import * as path from 'path';

async function backupDatabase() {
  try {
    console.log('Starting database backup...');
    const db = getDb();
    const backupDir = path.join(process.cwd(), 'backups');
    
    // Create backups directory if it doesn't exist
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(backupDir, `backup-${timestamp}.json`);

    // Export key tables
    const backup: any = {
      timestamp: new Date().toISOString(),
      version: '1.0',
      tables: {},
    };

    // Backup indicators
    const { data: indicators, error: indicatorsError } = await (db as any).supabase
      .from('indicators')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100); // Last 100 indicators

    if (!indicatorsError && indicators) {
      backup.tables.indicators = indicators;
    }

    // Backup weekly_signals
    const { data: signals, error: signalsError } = await (db as any).supabase
      .from('weekly_signals')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50); // Last 50 signals

    if (!signalsError && signals) {
      backup.tables.weekly_signals = signals;
    }

    // Backup subscriptions (without sensitive data)
    const { data: subscriptions, error: subscriptionsError } = await (db as any).supabase
      .from('subscriptions')
      .select('id, user_id, status, plan, current_period_start, current_period_end, cancel_at_period_end, created_at')
      .order('created_at', { ascending: false });

    if (!subscriptionsError && subscriptions) {
      backup.tables.subscriptions = subscriptions;
    }

    // Write backup to file
    fs.writeFileSync(backupFile, JSON.stringify(backup, null, 2));
    console.log(`✅ Backup created: ${backupFile}`);

    // Clean up old backups (keep last 10)
    const backups = fs.readdirSync(backupDir)
      .filter(file => file.startsWith('backup-') && file.endsWith('.json'))
      .map(file => ({
        name: file,
        path: path.join(backupDir, file),
        time: fs.statSync(path.join(backupDir, file)).mtime.getTime(),
      }))
      .sort((a, b) => b.time - a.time);

    // Delete backups older than 10
    if (backups.length > 10) {
      const toDelete = backups.slice(10);
      for (const backup of toDelete) {
        fs.unlinkSync(backup.path);
        console.log(`🗑️  Deleted old backup: ${backup.name}`);
      }
    }

    console.log('✅ Backup completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Backup failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  backupDatabase();
}

export { backupDatabase };

