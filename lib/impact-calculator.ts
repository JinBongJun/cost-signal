import { IndicatorData } from './db';
import { SpendingPattern } from './types';

export interface ImpactBreakdown {
  indicator: 'gas' | 'cpi' | 'interest_rate' | 'unemployment';
  impact: number; // Dollar amount per week
  level: 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';
  context?: string; // Context description based on user settings (e.g., "주유 주 1회 기준")
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

    // Generate context description based on user settings
    let context: string | undefined;
    if (spendingPattern) {
      switch (indicator.indicator_type) {
        case 'gas':
          if (spendingPattern.transport_mode === 'public') {
            context = '대중교통 사용 (영향 없음)';
          } else if (spendingPattern.transport_mode === 'mixed') {
            context = getGasFrequencyLabel(spendingPattern.gas_frequency) + ' (혼합 교통)';
          } else if (spendingPattern.gas_frequency) {
            context = getGasFrequencyLabel(spendingPattern.gas_frequency) + ' 기준';
          }
          break;
        case 'cpi':
          if (spendingPattern.monthly_rent) {
            context = `월 렌트 $${spendingPattern.monthly_rent.toLocaleString()} 기준`;
          } else {
            context = '평균 지출 기준';
          }
          break;
        case 'interest_rate':
          if (spendingPattern.has_debt) {
            context = '대출 있음';
          } else {
            context = '대출 없음 (영향 없음)';
          }
          break;
      }
    }

    breakdown.push({
      indicator: indicator.indicator_type,
      impact,
      level,
      context,
    });
  }

  const totalWeeklyChange = breakdown.reduce((sum, item) => sum + item.impact, 0);

  return {
    totalWeeklyChange,
    breakdown,
  };
}

/**
 * Calculate gas price impact based on user's gas frequency and transport mode
 */
function calculateGasImpact(
  indicator: IndicatorData,
  pattern: SpendingPattern
): number {
  if (!pattern.gas_frequency || !indicator.previous_value || indicator.change_percent === null) {
    return 0;
  }

  // Apply transport_mode multiplier
  let transportMultiplier = 1.0;
  if (pattern.transport_mode === 'public') {
    // Public transportation users: no gas impact
    return 0;
  } else if (pattern.transport_mode === 'mixed') {
    // Mixed transport: 50% of gas impact
    transportMultiplier = 0.5;
  }
  // 'car' or null: full impact (multiplier = 1.0)

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

  // Weekly impact = (price change per gallon) × (tank size) × (weekly fill-ups) × (transport multiplier)
  const weeklyImpact = priceChange * avgTankSize * weeklyFillUps * transportMultiplier;

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

/**
 * Calculate average impact using default spending patterns
 * This represents what an "average user" would experience
 */
export function calculateAverageImpact(indicators: IndicatorData[]): WeeklyImpact {
  // Average user pattern:
  // - Weekly gas fill-up (most common)
  // - $1,500 monthly rent (US average)
  // - Medium food ratio (mixed eating out/groceries)
  // - Car transport (most common)
  // - Has debt (most US households have some debt)
  const averagePattern: SpendingPattern = {
    gas_frequency: 'weekly',
    monthly_rent: 1500,
    food_ratio: 'medium',
    transport_mode: 'car',
    has_debt: true,
  };

  return calculateWeeklyImpact(indicators, averagePattern);
}

/**
 * Get human-readable label for gas frequency
 */
function getGasFrequencyLabel(frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly' | null | undefined): string {
  switch (frequency) {
    case 'daily':
      return '주유 매일';
    case 'weekly':
      return '주유 주 1회';
    case 'biweekly':
      return '주유 격주 1회';
    case 'monthly':
      return '주유 월 1회';
    default:
      return '주유 빈도 미설정';
  }
}

