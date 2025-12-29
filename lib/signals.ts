import { IndicatorData, getDb } from './db';
import { calculateChangePercent } from './utils';

export type IndicatorStatus = 'ok' | 'caution' | 'risk';
export type OverallStatus = 'ok' | 'caution' | 'risk';

/**
 * Determine gas price status (3 levels: OK, CAUTION, RISK)
 * 
 * RISK if:
 * - Price rose >10% in one week (consumer behavior change threshold), OR
 * - Price has risen for 3+ consecutive weeks (sustained trend)
 * 
 * CAUTION if:
 * - Price rose 5-10% in one week (noticeable but not critical), OR
 * - Price has risen for 2 consecutive weeks (early trend)
 * 
 * OK if:
 * - Price rose <5% in one week and no sustained trend
 * 
 * Based on actual consumer burden: 10% weekly increase is when consumers start changing behavior
 */
export async function evaluateGasPrice(currentValue: number, previousValue: number | null): Promise<IndicatorStatus> {
  if (previousValue === null) {
    return 'ok'; // First data point, no comparison
  }

  const changePercent = calculateChangePercent(currentValue, previousValue);
  if (changePercent === null) return 'ok';

  // RISK if sharp increase (>10% in one week) - actual consumer burden threshold
  if (changePercent > 10) {
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

  // CAUTION if moderate increase (5-10%) or 2 consecutive weeks of increases
  if (changePercent > 5) {
    return 'caution';
  }

  if (recent.length >= 2) {
    let consecutiveIncreases = 0;
    for (let i = 0; i < recent.length - 1; i++) {
      const current = recent[i];
      if (current && current.previous_value !== null && current.value > current.previous_value) {
        consecutiveIncreases++;
      }
    }
    if (consecutiveIncreases >= 2) {
      return 'caution';
    }
  }

  return 'ok';
}

/**
 * Determine CPI status (3 levels: OK, CAUTION, RISK)
 * 
 * RISK if:
 * - MoM increase >0.5% (Fed's concern threshold), OR
 * - Has increased for 2+ consecutive months
 * 
 * CAUTION if:
 * - MoM increase 0.3-0.5% (noticeable inflation), OR
 * - Has increased for 1 consecutive month (early trend)
 * 
 * OK if:
 * - MoM increase <0.3% and no sustained trend
 * 
 * Based on actual consumer burden: 0.5% monthly = ~6% annual, which is 3x Fed's 2% target
 */
export async function evaluateCPI(currentValue: number, previousValue: number | null): Promise<IndicatorStatus> {
  if (previousValue === null) {
    return 'ok';
  }

  const changePercent = calculateChangePercent(currentValue, previousValue);
  if (changePercent === null) return 'ok';

  // RISK if notable MoM increase (>0.5% - Fed's actual concern threshold)
  if (changePercent > 0.5) {
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

  // CAUTION if moderate increase (0.3-0.5%) or 1 consecutive month of increase
  if (changePercent > 0.3) {
    return 'caution';
  }

  if (recent.length >= 1) {
    const latest = recent[0];
    if (latest && latest.previous_value !== null && latest.value > latest.previous_value) {
      return 'caution';
    }
  }

  return 'ok';
}

/**
 * Determine interest rate status (3 levels: OK, CAUTION, RISK)
 * 
 * RISK if:
 * - Rate increased by >0.25% (Fed's typical rate change), OR
 * - Rate has increased for 2+ consecutive months (sustained trend)
 * 
 * CAUTION if:
 * - Rate increased by 0.1-0.25% (moderate increase), OR
 * - Rate has increased for 1 consecutive month (early trend)
 * 
 * OK if:
 * - Rate increased <0.1% and no sustained trend
 * 
 * 0.25% is Fed's typical adjustment that affects mortgages, credit cards, etc.
 */
export async function evaluateInterestRate(currentValue: number, previousValue: number | null): Promise<IndicatorStatus> {
  if (previousValue === null) {
    return 'ok';
  }

  const changePercent = calculateChangePercent(currentValue, previousValue);
  if (changePercent === null) return 'ok';

  const absoluteChange = currentValue - previousValue;

  // RISK if rate increased by >0.25% (Fed's typical rate change)
  if (currentValue > previousValue && absoluteChange >= 0.25) {
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

  // CAUTION if moderate increase (0.1-0.25%) or 1 consecutive month of increase
  if (currentValue > previousValue && absoluteChange >= 0.1) {
    return 'caution';
  }

  if (recent.length >= 1) {
    const latest = recent[0];
    if (latest && latest.previous_value !== null && latest.value > latest.previous_value) {
      return 'caution';
    }
  }

  return 'ok';
}

/**
 * Determine unemployment status (3 levels: OK, CAUTION, RISK)
 * 
 * RISK if:
 * - Unemployment increased by >0.3% in one month (significant jump), OR
 * - Unemployment has increased for 2+ consecutive months (sustained trend)
 * 
 * CAUTION if:
 * - Unemployment increased by 0.2-0.3% in one month (noticeable increase)
 * 
 * OK if:
 * - Unemployment increased <0.2% and no sustained trend
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

  // CAUTION if moderate increase (0.2-0.3%)
  if (changePercent > 0.2) {
    return 'caution';
  }

  return 'ok';
}

/**
 * Calculate overall signal from individual indicator statuses (3 levels)
 * 
 * Logic:
 * - 2+ RISK indicators → 🔴 RISK
 * - 1 RISK indicator → 🟡 CAUTION
 * - 0 RISK, 2+ CAUTION indicators → 🟡 CAUTION
 * - 0 RISK, 1 CAUTION indicator → 🟡 CAUTION
 * - 0 RISK, 0 CAUTION → 🟢 OK
 */
export function calculateOverallSignal(indicators: Omit<IndicatorData, 'id' | 'created_at'>[]): { status: OverallStatus; riskCount: number } {
  const riskCount = indicators.filter(ind => ind.status === 'risk').length;
  const cautionCount = indicators.filter(ind => ind.status === 'caution').length;

  if (riskCount >= 2) {
    return { status: 'risk', riskCount };
  } else if (riskCount === 1) {
    return { status: 'caution', riskCount: 1 };
  } else if (cautionCount >= 1) {
    return { status: 'caution', riskCount: 0 };
  } else {
    return { status: 'ok', riskCount: 0 };
  }
}

