/**
 * Weekly cron job to fetch economic data and compute signals
 * Run this script weekly (e.g., every Monday via cron or scheduler)
 */

// Load environment variables from .env file
import 'dotenv/config';

import { getCurrentWeekStart, calculateChangePercent } from '../lib/utils';
import { getDb } from '../lib/db';
import { fetchGasPrice } from '../lib/fetchers/eia';
import { fetchCPI } from '../lib/fetchers/bls';
import { fetchInterestRate, fetchUnemploymentRate } from '../lib/fetchers/fred';
import {
  evaluateGasPrice,
  evaluateCPI,
  evaluateInterestRate,
  evaluateUnemployment,
  calculateOverallSignal,
} from '../lib/signals';
import { generateExplanation } from '../lib/explainer';
import { sendWeeklySignalNotification } from '../lib/push';

async function runWeeklyUpdate() {
  console.log('Starting weekly economic data update...');
  const weekStart = getCurrentWeekStart();
  console.log(`Week start: ${weekStart}`);

  const db = getDb();

  try {
    // Check if we already have data for this week
    const existingSignal = await db.getWeeklySignal(weekStart);
    if (existingSignal) {
      console.log(`Signal already computed for week ${weekStart}`);
      return;
    }

    // Fetch all indicators
    console.log('Fetching economic data...');
    const [gasData, cpiData, interestData, unemploymentData] = await Promise.all([
      fetchGasPrice(),
      fetchCPI(),
      fetchInterestRate(),
      fetchUnemploymentRate(),
    ]);

    // Get previous values
    const [prevGas, prevCPI, prevInterest, prevUnemployment] = await Promise.all([
      db.getLatestIndicator('gas'),
      db.getLatestIndicator('cpi'),
      db.getLatestIndicator('interest_rate'),
      db.getLatestIndicator('unemployment'),
    ]);

    // Process each indicator
    const indicators = [];

    // Gas Price
    if (gasData) {
      const previousValue = prevGas?.value || null;
      const changePercent = calculateChangePercent(gasData.value, previousValue);
      const status = await evaluateGasPrice(gasData.value, previousValue);

      await db.saveIndicator({
        week_start: weekStart,
        indicator_type: 'gas',
        value: gasData.value,
        previous_value: previousValue,
        change_percent: changePercent,
        status,
      });

      indicators.push({
        week_start: weekStart,
        indicator_type: 'gas' as const,
        value: gasData.value,
        previous_value: previousValue,
        change_percent: changePercent,
        status,
      });

      console.log(`Gas: $${gasData.value.toFixed(2)}/gal (${status})`);
    }

    // CPI
    if (cpiData) {
      const previousValue = prevCPI?.value || null;
      const changePercent = calculateChangePercent(cpiData.value, previousValue);
      const status = await evaluateCPI(cpiData.value, previousValue);

      await db.saveIndicator({
        week_start: weekStart,
        indicator_type: 'cpi',
        value: cpiData.value,
        previous_value: previousValue,
        change_percent: changePercent,
        status,
      });

      indicators.push({
        week_start: weekStart,
        indicator_type: 'cpi' as const,
        value: cpiData.value,
        previous_value: previousValue,
        change_percent: changePercent,
        status,
      });

      console.log(`CPI: ${cpiData.value.toFixed(2)} (${status})`);
    }

    // Interest Rate
    if (interestData) {
      const previousValue = prevInterest?.value || null;
      const changePercent = calculateChangePercent(interestData.value, previousValue);
      const status = await evaluateInterestRate(interestData.value, previousValue);

      await db.saveIndicator({
        week_start: weekStart,
        indicator_type: 'interest_rate',
        value: interestData.value,
        previous_value: previousValue,
        change_percent: changePercent,
        status,
      });

      indicators.push({
        week_start: weekStart,
        indicator_type: 'interest_rate' as const,
        value: interestData.value,
        previous_value: previousValue,
        change_percent: changePercent,
        status,
      });

      console.log(`Interest Rate: ${interestData.value.toFixed(2)}% (${status})`);
    }

    // Unemployment
    if (unemploymentData) {
      const previousValue = prevUnemployment?.value || null;
      const changePercent = calculateChangePercent(unemploymentData.value, previousValue);
      const status = await evaluateUnemployment(unemploymentData.value, previousValue);

      await db.saveIndicator({
        week_start: weekStart,
        indicator_type: 'unemployment',
        value: unemploymentData.value,
        previous_value: previousValue,
        change_percent: changePercent,
        status,
      });

      indicators.push({
        week_start: weekStart,
        indicator_type: 'unemployment' as const,
        value: unemploymentData.value,
        previous_value: previousValue,
        change_percent: changePercent,
        status,
      });

      console.log(`Unemployment: ${unemploymentData.value.toFixed(2)}% (${status})`);
    }

    // Calculate overall signal
    const { status: overallStatus, riskCount } = calculateOverallSignal(indicators);
    console.log(`Overall signal: ${overallStatus.toUpperCase()} (${riskCount} risk indicators)`);

    // Generate explanation
    console.log('Generating explanation...');
    const explanation = await generateExplanation(
      {
        week_start: weekStart,
        overall_status: overallStatus,
        risk_count: riskCount,
        explanation: null,
      } as any,
      indicators as any
    );

    // Save weekly signal
    await db.saveWeeklySignal({
      week_start: weekStart,
      overall_status: overallStatus,
      risk_count: riskCount,
      explanation,
    });

    console.log('Weekly update completed successfully!');
    console.log(`Signal: ${overallStatus.toUpperCase()}`);
    console.log(`Explanation: ${explanation}`);

    // Send push notifications to all subscribers
    console.log('Sending push notifications...');
    const notificationResult = await sendWeeklySignalNotification();
    console.log(`Notifications sent: ${notificationResult.sent} successful, ${notificationResult.failed} failed`);

  } catch (error) {
    console.error('Error in weekly update:', error);
    throw error;
  } finally {
    await db.close();
  }
}

// Run if called directly
if (require.main === module) {
  runWeeklyUpdate()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

export { runWeeklyUpdate };

