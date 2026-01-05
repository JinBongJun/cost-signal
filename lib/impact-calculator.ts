import { IndicatorData } from './db';
import { SpendingPattern } from './types';

export interface ImpactBreakdown {
  indicator: 'gas' | 'cpi' | 'interest_rate' | 'unemployment';
  impact: number; // Dollar amount per week
  level: 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';
}

export interface WeeklyImpact {
  totalWeeklyChange: number; // Total dollar impact per week
  breakdown: ImpactBreakdown[];
}

/**
 * Calculate weekly cost impact based on user spending pattern and indicator changes
 */
export function calculateWeeklyImpact(
  indicators: IndicatorData[],
  spendingPattern: SpendingPattern | null
): WeeklyImpact {
  if (!spendingPattern) {
    // If no spending pattern, return zero impact
    return {
      totalWeeklyChange: 0,
      breakdown: indicators.map(ind => ({
        indicator: ind.indicator_type,
        impact: 0,
        level: 'NONE' as const,
      })),
    };
  }

  const breakdown: ImpactBreakdown[] = [];

  // Calculate impact for each indicator
  for (const indicator of indicators) {
    let impact = 0;
    let level: 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE' = 'NONE';

    switch (indicator.indicator_type) {
      case 'gas':
        impact = calculateGasImpact(indicator, spendingPattern);
        break;
      case 'cpi':
        impact = calculateCPIImpact(indicator, spendingPattern);
        break;
      case 'interest_rate':
        impact = calculateInterestRateImpact(indicator, spendingPattern);
        break;
      case 'unemployment':
        // Unemployment doesn't directly impact weekly spending (it's more of a risk indicator)
        impact = 0;
        level = 'NONE';
        break;
    }

    // Determine impact level
    if (impact === 0) {
      level = 'NONE';
    } else if (Math.abs(impact) >= 3) {
      level = 'HIGH';
    } else if (Math.abs(impact) >= 1) {
      level = 'MEDIUM';
    } else {
      level = 'LOW';
    }

    breakdown.push({
      indicator: indicator.indicator_type,
      impact,
      level,
    });
  }

  const totalWeeklyChange = breakdown.reduce((sum, item) => sum + item.impact, 0);

  return {
    totalWeeklyChange,
    breakdown,
  };
}

/**
 * Calculate gas price impact based on user's gas frequency
 */
function calculateGasImpact(
  indicator: IndicatorData,
  pattern: SpendingPattern
): number {
  if (!pattern.gas_frequency || !indicator.previous_value || indicator.change_percent === null) {
    return 0;
  }

  // Average gas tank size: 12-15 gallons, use 13.5 as average
  const avgTankSize = 13.5;
  const currentPrice = indicator.value;
  const previousPrice = indicator.previous_value;
  const priceChange = currentPrice - previousPrice;

  // Calculate weekly impact based on frequency
  let weeklyFillUps = 0;
  switch (pattern.gas_frequency) {
    case 'daily':
      weeklyFillUps = 7;
      break;
    case 'weekly':
      weeklyFillUps = 1;
      break;
    case 'biweekly':
      weeklyFillUps = 0.5;
      break;
    case 'monthly':
      weeklyFillUps = 0.25; // ~1 per month = 0.25 per week
      break;
  }

  // Weekly impact = (price change per gallon) × (tank size) × (weekly fill-ups)
  const weeklyImpact = priceChange * avgTankSize * weeklyFillUps;

  return Math.round(weeklyImpact * 100) / 100; // Round to 2 decimal places
}

/**
 * Calculate CPI (inflation) impact based on user's spending pattern
 */
function calculateCPIImpact(
  indicator: IndicatorData,
  pattern: SpendingPattern
): number {
  if (!indicator.previous_value || indicator.change_percent === null) {
    return 0;
  }

  // Base monthly spending estimate (if rent is provided, use it as a baseline)
  // Otherwise, use average US household spending: ~$5,000/month
  const baseMonthlySpending = pattern.monthly_rent 
    ? pattern.monthly_rent * 3 // Rough estimate: rent is ~1/3 of expenses
    : 5000;

  // Adjust for food ratio (eating out is more affected by CPI)
  let foodMultiplier = 1.0;
  if (pattern.food_ratio === 'high') {
    foodMultiplier = 1.2; // Eating out more affected
  } else if (pattern.food_ratio === 'low') {
    foodMultiplier = 0.8; // Groceries less affected
  }

  // CPI change as decimal (e.g., 0.3% = 0.003)
  const cpiChange = indicator.change_percent / 100;

  // Weekly impact = (monthly spending / 4.33 weeks) × CPI change × food multiplier
  const weeklySpending = baseMonthlySpending / 4.33;
  const weeklyImpact = weeklySpending * cpiChange * foodMultiplier;

  return Math.round(weeklyImpact * 100) / 100;
}

/**
 * Calculate interest rate impact based on user's debt status
 */
function calculateInterestRateImpact(
  indicator: IndicatorData,
  pattern: SpendingPattern
): number {
  if (!pattern.has_debt || !indicator.previous_value || indicator.change_percent === null) {
    return 0;
  }

  // Average US household debt: ~$145,000 (mortgage + credit cards + other)
  // For simplicity, use a conservative estimate: $50,000 in interest-bearing debt
  const avgDebt = 50000;

  // Interest rate change as decimal (e.g., 0.25% = 0.0025)
  const rateChange = (indicator.value - indicator.previous_value) / 100;

  // Weekly impact = (debt × rate change) / 52 weeks
  // This is a simplified calculation - actual impact depends on debt type and terms
  const weeklyImpact = (avgDebt * rateChange) / 52;

  return Math.round(weeklyImpact * 100) / 100;
}

