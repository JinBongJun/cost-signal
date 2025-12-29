import { IndicatorData, getDb } from './db';
import { calculateChangePercent } from './utils';

export type IndicatorStatus = 'ok' | 'risk';
export type OverallStatus = 'ok' | 'caution' | 'risk';

/**
 * Determine gas price status
 * RISK if:
 * - Price rose >8% in one week (more meaningful threshold), OR
 * - Price has risen for 3+ consecutive weeks (sustained trend)
 * 
 * Improved threshold: 5% → 8% to reduce false alarms while catching significant changes
 */
export async function evaluateGasPrice(currentValue: number, previousValue: number | null): Promise<IndicatorStatus> {
  if (previousValue === null) {
    return 'ok'; // First data point, no comparison
  }

  const changePercent = calculateChangePercent(currentValue, previousValue);
  if (changePercent === null) return 'ok';

  // RISK if sharp increase (>8% in one week) - more meaningful threshold
  if (changePercent > 8) {
    return 'risk';
  }

  // Check for consecutive weeks of increases (sustained trend)
  const recent = await getDb().getRecentIndicators('gas', 4);
  if (recent.length >= 3) {
    // Check if price has risen for 3+ consecutive weeks
    let consecutiveIncreases = 0;
    for (let i = 0; i < recent.length - 1; i++) {
      const current = recent[i];
      if (current && current.previous_value !== null && current.value > current.previous_value) {
        consecutiveIncreases++;
      }
    }
    if (consecutiveIncreases >= 3) {
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

  // RISK if notable MoM increase (>0.6% - slightly more conservative)
  if (changePercent > 0.6) {
    return 'risk';
  }

  // Check for sustained increases (2+ consecutive months)
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
 * - Rate increased by >0.25% (Fed's typical rate change), OR
 * - Rate has increased for 2+ consecutive months (sustained trend)
 * 
 * Improved: Only flag meaningful rate changes (0.25% is Fed's typical adjustment)
 */
export async function evaluateInterestRate(currentValue: number, previousValue: number | null): Promise<IndicatorStatus> {
  if (previousValue === null) {
    return 'ok';
  }

  const changePercent = calculateChangePercent(currentValue, previousValue);
  if (changePercent === null) return 'ok';

  // RISK if rate increased by >0.25% (Fed's typical rate change)
  // This filters out minor fluctuations
  if (currentValue > previousValue && (currentValue - previousValue) >= 0.25) {
    return 'risk';
  }

  // Check for sustained increases (2+ consecutive months)
  const recent = await getDb().getRecentIndicators('interest_rate', 3);
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
 * Determine unemployment status
 * RISK if:
 * - Unemployment increased by >0.3% in one month (significant jump), OR
 * - Unemployment has increased for 2+ consecutive months (sustained trend)
 * 
 * Unemployment is relatively stable, so both single large increases and sustained trends matter
 */
export async function evaluateUnemployment(currentValue: number, previousValue: number | null): Promise<IndicatorStatus> {
  if (previousValue === null) {
    return 'ok';
  }

  const changePercent = calculateChangePercent(currentValue, previousValue);
  if (changePercent === null) return 'ok';

  // RISK if unemployment increased by >0.3% in one month (significant jump)
  if (changePercent > 0.3) {
    return 'risk';
  }

  // Check for consecutive upward trend (2+ consecutive months)
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

