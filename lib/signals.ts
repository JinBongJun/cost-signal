import { IndicatorData, getDb } from './db';
import { calculateChangePercent } from './utils';

export type IndicatorStatus = 'ok' | 'risk';
export type OverallStatus = 'ok' | 'caution' | 'risk';

/**
 * Determine gas price status
 * RISK if:
 * - Price rose >5% in one week, OR
 * - Price has risen for 3+ consecutive weeks
 */
export async function evaluateGasPrice(currentValue: number, previousValue: number | null): Promise<IndicatorStatus> {
  if (previousValue === null) {
    return 'ok'; // First data point, no comparison
  }

  const changePercent = calculateChangePercent(currentValue, previousValue);
  if (changePercent === null) return 'ok';

  // RISK if sharp increase (>5% in one week)
  if (changePercent > 5) {
    return 'risk';
  }

  // Check for consecutive weeks of increases
  const recent = await getDb().getRecentIndicators('gas', 3);
  if (recent.length >= 3) {
    // Check if all 3 recent weeks show increases
    let consecutiveIncreases = 0;
    for (let i = 0; i < recent.length - 1; i++) {
      const current = recent[i];
      if (current && current.previous_value !== null && current.value > current.previous_value) {
        consecutiveIncreases++;
      }
    }
    if (consecutiveIncreases >= 2) {
      return 'risk';
    }
  }

  return 'ok';
}

/**
 * Determine CPI status
 * RISK if:
 * - MoM increase >0.5%, OR
 * - Has increased for 2+ consecutive months
 */
export async function evaluateCPI(currentValue: number, previousValue: number | null): Promise<IndicatorStatus> {
  if (previousValue === null) {
    return 'ok';
  }

  const changePercent = calculateChangePercent(currentValue, previousValue);
  if (changePercent === null) return 'ok';

  // RISK if notable MoM increase (>0.5%)
  if (changePercent > 0.5) {
    return 'risk';
  }

  // Check for sustained increases
  const recent = await getDb().getRecentIndicators('cpi', 2);
  if (recent.length >= 2) {
    let consecutiveIncreases = 0;
    for (const indicator of recent) {
      if (indicator.previous_value !== null && indicator.value > indicator.previous_value) {
        consecutiveIncreases++;
      }
    }
    if (consecutiveIncreases >= 2) {
      return 'risk';
    }
  }

  return 'ok';
}

/**
 * Determine interest rate status
 * RISK if:
 * - Rate has increased in the last 3 months
 */
export async function evaluateInterestRate(currentValue: number, previousValue: number | null): Promise<IndicatorStatus> {
  if (previousValue === null) {
    return 'ok';
  }

  // RISK if rate has increased
  if (currentValue > previousValue) {
    return 'risk';
  }

  // Also check recent trend
  const recent = await getDb().getRecentIndicators('interest_rate', 3);
  if (recent.length >= 2) {
    // If rate has increased in any of the recent periods, it's a risk
    for (const indicator of recent) {
      if (indicator.previous_value !== null && indicator.value > indicator.previous_value) {
        return 'risk';
      }
    }
  }

  return 'ok';
}

/**
 * Determine unemployment status
 * RISK if:
 * - Unemployment has increased for 2+ consecutive months
 */
export async function evaluateUnemployment(currentValue: number, previousValue: number | null): Promise<IndicatorStatus> {
  if (previousValue === null) {
    return 'ok';
  }

  // Check for consecutive upward trend
  const recent = await getDb().getRecentIndicators('unemployment', 2);
  if (recent.length >= 2) {
    let consecutiveIncreases = 0;
    for (const indicator of recent) {
      if (indicator.previous_value !== null && indicator.value > indicator.previous_value) {
        consecutiveIncreases++;
      }
    }
    if (consecutiveIncreases >= 2) {
      return 'risk';
    }
  }

  return 'ok';
}

/**
 * Calculate overall signal from individual indicator statuses
 * - 0 risk indicators → 🟢 OK
 * - 1 risk indicator → 🟡 CAUTION
 * - 2+ risk indicators → 🔴 RISK
 */
export function calculateOverallSignal(indicators: Omit<IndicatorData, 'id' | 'created_at'>[]): { status: OverallStatus; riskCount: number } {
  const riskCount = indicators.filter(ind => ind.status === 'risk').length;

  if (riskCount === 0) {
    return { status: 'ok', riskCount: 0 };
  } else if (riskCount === 1) {
    return { status: 'caution', riskCount: 1 };
  } else {
    return { status: 'risk', riskCount };
  }
}

