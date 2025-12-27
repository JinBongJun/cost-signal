/**
 * Cron job setup for weekly data updates
 * Runs every Monday at 9 AM UTC
 */

import cron from 'node-cron';
import { runWeeklyUpdate } from '../scripts/run-cron';

let cronJob: cron.ScheduledTask | null = null;

export function startCron() {
  if (cronJob) {
    console.log('Cron job already running');
    return;
  }

  // Run every Monday at 9 AM UTC
  cronJob = cron.schedule('0 9 * * 1', async () => {
    console.log('Running scheduled weekly update...');
    try {
      await runWeeklyUpdate();
    } catch (error) {
      console.error('Scheduled update failed:', error);
    }
  }, {
    scheduled: true,
    timezone: 'UTC',
  });

  console.log('Cron job started: Weekly updates every Monday at 9 AM UTC');
}

export function stopCron() {
  if (cronJob) {
    cronJob.stop();
    cronJob = null;
    console.log('Cron job stopped');
  }
}

