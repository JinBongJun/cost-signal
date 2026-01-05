import { WeeklySignal, IndicatorData } from './db';

export interface TrendSummary {
  summary: string;
  weeksWithIncrease: number;
  weeksWithDecrease: number;
  weeksStable: number;
  totalWeeks: number;
}

/**
 * Analyze trends from the last 8 weeks of signals
 * Returns a text summary of the trend
 */
export async function analyzeTrends(
  signals: WeeklySignal[],
  getIndicatorsForWeek: (weekStart: string) => Promise<IndicatorData[]>
): Promise<TrendSummary> {
  if (signals.length === 0) {
    return {
      summary: 'No historical data available yet.',
      weeksWithIncrease: 0,
      weeksWithDecrease: 0,
      weeksStable: 0,
      totalWeeks: 0,
    };
  }

  // Limit to last 8 weeks
  const recentSignals = signals.slice(0, 8);
  
  let weeksWithIncrease = 0;
  let weeksWithDecrease = 0;
  let weeksStable = 0;

  // Analyze each week
  for (const signal of recentSignals) {
    const indicators = await getIndicatorsForWeek(signal.week_start);
    
    // Count indicators with positive change
    const positiveChanges = indicators.filter(
      ind => ind.change_percent !== null && ind.change_percent > 0
    ).length;
    
    // Count indicators with negative change
    const negativeChanges = indicators.filter(
      ind => ind.change_percent !== null && ind.change_percent < 0
    ).length;

    // Determine week trend
    if (positiveChanges > negativeChanges) {
      weeksWithIncrease++;
    } else if (negativeChanges > positiveChanges) {
      weeksWithDecrease++;
    } else {
      weeksStable++;
    }
  }

  // Generate summary text
  const totalWeeks = recentSignals.length;
  let summary = '';
  
  if (weeksWithIncrease > weeksWithDecrease && weeksWithIncrease > weeksStable) {
    summary = `Over the past ${totalWeeks} weeks, ${weeksWithIncrease} week${weeksWithIncrease !== 1 ? 's' : ''} showed cost increase trends, indicating a period of rising expenses.`;
  } else if (weeksWithDecrease > weeksWithIncrease && weeksWithDecrease > weeksStable) {
    summary = `Over the past ${totalWeeks} weeks, ${weeksWithDecrease} week${weeksWithDecrease !== 1 ? 's' : ''} showed cost decrease trends, indicating a period of declining expenses.`;
  } else if (weeksStable > 0) {
    summary = `Over the past ${totalWeeks} weeks, the trend has been relatively stable, with ${weeksStable} week${weeksStable !== 1 ? 's' : ''} showing minimal changes.`;
  } else {
    summary = `Over the past ${totalWeeks} weeks, there has been a mixed pattern with both increases and decreases in cost indicators.`;
  }

  return {
    summary,
    weeksWithIncrease,
    weeksWithDecrease,
    weeksStable,
    totalWeeks,
  };
}

