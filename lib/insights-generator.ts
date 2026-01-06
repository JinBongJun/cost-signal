import { IndicatorData } from './db';
import { SpendingPattern, ActionableInsight, Prediction, SavingsOpportunity } from './types';
import { WeeklyImpact } from './impact-calculator';

/**
 * Generate actionable insights based on current indicators and user spending pattern
 */
export function generateActionableInsights(
  indicators: IndicatorData[],
  spendingPattern: SpendingPattern | null,
  impact: WeeklyImpact
): ActionableInsight[] {
  const insights: ActionableInsight[] = [];

  if (!spendingPattern) {
    return insights;
  }

  // Gas price insights
  const gasIndicator = indicators.find(ind => ind.indicator_type === 'gas');
  if (gasIndicator && gasIndicator.change_percent && gasIndicator.change_percent > 5) {
    const gasImpact = impact.breakdown.find(b => b.indicator === 'gas');
    if (gasImpact && gasImpact.impact > 0) {
      // Calculate potential savings by delaying fill-up
      const avgTankSize = 13.5;
      const currentPrice = gasIndicator.value;
      const priceChange = gasIndicator.value - (gasIndicator.previous_value || gasIndicator.value);
      
      // If price is rising, suggest delaying fill-up
      if (priceChange > 0 && spendingPattern.gas_frequency && spendingPattern.gas_frequency !== 'monthly') {
        const weeklyFillUps = getWeeklyFillUps(spendingPattern.gas_frequency);
        const savingsByDelaying = (priceChange * avgTankSize * weeklyFillUps) * 0.5; // Assume 50% can be delayed
        
        if (savingsByDelaying > 0.5) {
          insights.push({
            id: 'gas-delay-fillup',
            type: 'gas',
            priority: gasImpact.level === 'HIGH' ? 'high' : 'medium',
            title: '기름값 상승 중 - 주유 타이밍 조절',
            description: `이번 주 기름값이 ${gasIndicator.change_percent.toFixed(1)}% 상승했습니다.`,
            action: `필요한 만큼만 주유하고, 다음 주까지 미루면 주간 약 $${savingsByDelaying.toFixed(2)} 절약 가능합니다.`,
            potentialSavings: savingsByDelaying,
            urgency: 'now',
            icon: '⛽',
          });
        }
      }
    }

    // Suggest public transportation if using car
    if (spendingPattern.transport_mode === 'car' && gasImpact && gasImpact.impact > 2) {
      const weeklySavings = gasImpact.impact * 0.3; // Assume 30% can be replaced
      insights.push({
        id: 'gas-use-public',
        type: 'gas',
        priority: 'medium',
        title: '대중교통 활용으로 절약',
        description: `기름값 상승으로 주간 ${gasImpact.impact.toFixed(2)}달러 추가 지출 예상됩니다.`,
        action: `주 1-2회 대중교통을 이용하면 주간 약 $${weeklySavings.toFixed(2)} 절약 가능합니다.`,
        potentialSavings: weeklySavings,
        urgency: 'this_week',
        icon: '🚇',
      });
    }
  }

  // CPI insights
  const cpiIndicator = indicators.find(ind => ind.indicator_type === 'cpi');
  if (cpiIndicator && cpiIndicator.change_percent && cpiIndicator.change_percent > 0.2) {
    const cpiImpact = impact.breakdown.find(b => b.indicator === 'cpi');
    if (cpiImpact && cpiImpact.impact > 0) {
      // Suggest bulk buying for groceries
      if (spendingPattern.food_ratio && spendingPattern.food_ratio !== 'low') {
        const monthlySavings = (cpiImpact.impact * 4.33) * 0.15; // 15% savings from bulk buying
        insights.push({
          id: 'cpi-bulk-buying',
          type: 'cpi',
          priority: cpiImpact.level === 'HIGH' ? 'high' : 'medium',
          title: '식료품 대량 구매로 절약',
          description: `인플레이션으로 주간 ${cpiImpact.impact.toFixed(2)}달러 추가 지출 예상됩니다.`,
          action: `식료품을 대량 구매하거나 할인 시기에 구매하면 월 약 $${monthlySavings.toFixed(2)} 절약 가능합니다.`,
          potentialSavings: monthlySavings / 4.33, // Convert to weekly
          urgency: 'this_week',
          icon: '🛒',
        });
      }

      // Suggest reducing eating out
      if (spendingPattern.food_ratio === 'high') {
        const weeklySavings = cpiImpact.impact * 0.4; // 40% savings from reducing eating out
        insights.push({
          id: 'cpi-reduce-eating-out',
          type: 'cpi',
          priority: 'medium',
          title: '외식 줄이기로 절약',
          description: `인플레이션으로 외식 비용이 더 많이 증가하고 있습니다.`,
          action: `주 1-2회 외식을 줄이고 집에서 요리하면 주간 약 $${weeklySavings.toFixed(2)} 절약 가능합니다.`,
          potentialSavings: weeklySavings,
          urgency: 'this_week',
          icon: '🍳',
        });
      }
    }
  }

  // Interest rate insights
  const interestIndicator = indicators.find(ind => ind.indicator_type === 'interest_rate');
  if (interestIndicator && spendingPattern.has_debt) {
    const interestImpact = impact.breakdown.find(b => b.indicator === 'interest_rate');
    if (interestImpact && interestImpact.impact > 0) {
      const rateChange = interestIndicator.value - (interestIndicator.previous_value || interestIndicator.value);
      if (rateChange > 0) {
        // Suggest refinancing or paying down debt
        const monthlySavings = (interestImpact.impact * 4.33) * 0.2; // 20% potential savings
        insights.push({
          id: 'interest-refinance',
          type: 'interest_rate',
          priority: interestImpact.level === 'HIGH' ? 'high' : 'medium',
          title: '대출 재금융 고려',
          description: `금리가 ${rateChange.toFixed(2)}%p 상승했습니다.`,
          action: `대출 재금융이나 조기 상환을 고려하면 월 약 $${monthlySavings.toFixed(2)} 절약 가능합니다.`,
          potentialSavings: monthlySavings / 4.33,
          urgency: 'soon',
          icon: '💳',
        });
      }
    }
  }

  // Sort by priority and potential savings
  return insights.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    }
    return b.potentialSavings - a.potentialSavings;
  });
}

/**
 * Generate predictions for next week based on trends
 */
export function generatePredictions(
  indicators: IndicatorData[],
  historicalData?: IndicatorData[][]
): Prediction[] {
  const predictions: Prediction[] = [];

  indicators.forEach(indicator => {
    if (!indicator.previous_value || indicator.change_percent === null) {
      return;
    }

    const changePercent = indicator.change_percent;
    let direction: 'up' | 'down' | 'stable' = 'stable';
    let confidence: 'high' | 'medium' | 'low' = 'low';
    let expectedChange = 0;
    let recommendation = '';
    let timing: 'optimal' | 'good' | 'avoid' = 'good';

    // Simple trend-based prediction
    if (Math.abs(changePercent) > 5) {
      // Strong trend
      direction = changePercent > 0 ? 'up' : 'down';
      confidence = 'medium';
      expectedChange = changePercent * 0.5; // Assume 50% continuation
    } else if (Math.abs(changePercent) > 2) {
      // Moderate trend
      direction = changePercent > 0 ? 'up' : 'down';
      confidence = 'low';
      expectedChange = changePercent * 0.3; // Assume 30% continuation
    } else {
      direction = 'stable';
      confidence = 'medium';
      expectedChange = 0;
    }

    // Generate recommendations based on indicator type
    switch (indicator.indicator_type) {
      case 'gas':
        if (direction === 'up' && confidence === 'medium') {
          recommendation = '다음 주에도 기름값 상승 예상. 이번 주 주유를 미루면 절약 가능.';
          timing = 'optimal';
        } else if (direction === 'down') {
          recommendation = '다음 주 기름값 하락 예상. 이번 주는 최소한만 주유.';
          timing = 'optimal';
        } else {
          recommendation = '기름값이 안정적입니다. 평소대로 주유하셔도 됩니다.';
          timing = 'good';
        }
        break;
      case 'cpi':
        if (direction === 'up') {
          recommendation = '인플레이션이 지속될 가능성. 식료품 대량 구매 고려.';
          timing = 'optimal';
        } else {
          recommendation = '인플레이션이 안정적입니다.';
          timing = 'good';
        }
        break;
      case 'interest_rate':
        if (direction === 'up') {
          recommendation = '금리 상승 예상. 대출 재금융이나 조기 상환 고려.';
          timing = 'optimal';
        } else {
          recommendation = '금리가 안정적입니다.';
          timing = 'good';
        }
        break;
      default:
        recommendation = '변화 없음.';
        timing = 'good';
    }

    predictions.push({
      indicator: indicator.indicator_type,
      direction,
      confidence,
      expectedChange,
      recommendation,
      timing,
    });
  });

  return predictions;
}

/**
 * Generate savings opportunities based on spending pattern
 */
export function generateSavingsOpportunities(
  spendingPattern: SpendingPattern,
  impact: WeeklyImpact
): SavingsOpportunity[] {
  const opportunities: SavingsOpportunity[] = [];

  // Transport mode opportunity
  if (spendingPattern.transport_mode === 'car') {
    const gasImpact = impact.breakdown.find(b => b.indicator === 'gas');
    if (gasImpact && gasImpact.impact > 1) {
      const weeklySavings = gasImpact.impact * 0.3; // 30% savings from using public transport
      opportunities.push({
        id: 'transport-public',
        title: '대중교통 활용',
        description: '주 1-2회 대중교통을 이용하면 기름값을 절약할 수 있습니다.',
        currentPattern: '자차만 사용',
        suggestedChange: '주 1-2회 대중교통 이용',
        weeklySavings,
        monthlySavings: weeklySavings * 4.33,
        difficulty: 'medium',
        category: 'transport',
      });
    }
  }

  // Gas frequency opportunity
  if (spendingPattern.gas_frequency === 'daily' || spendingPattern.gas_frequency === 'weekly') {
    const gasImpact = impact.breakdown.find(b => b.indicator === 'gas');
    if (gasImpact && gasImpact.impact > 2) {
      const weeklySavings = gasImpact.impact * 0.25; // 25% savings from reducing frequency
      opportunities.push({
        id: 'gas-reduce-frequency',
        title: '주유 빈도 줄이기',
        description: '불필요한 운전을 줄이고 주유 빈도를 줄이면 절약할 수 있습니다.',
        currentPattern: getGasFrequencyLabel(spendingPattern.gas_frequency),
        suggestedChange: '주유 빈도 25% 감소',
        weeklySavings,
        monthlySavings: weeklySavings * 4.33,
        difficulty: 'medium',
        category: 'lifestyle',
      });
    }
  }

  // Food ratio opportunity
  if (spendingPattern.food_ratio === 'high') {
    const cpiImpact = impact.breakdown.find(b => b.indicator === 'cpi');
    if (cpiImpact && cpiImpact.impact > 1) {
      const weeklySavings = cpiImpact.impact * 0.3; // 30% savings from reducing eating out
      opportunities.push({
        id: 'food-reduce-eating-out',
        title: '외식 줄이기',
        description: '외식 빈도를 줄이고 집에서 요리하면 식비를 절약할 수 있습니다.',
        currentPattern: '외식 위주',
        suggestedChange: '주 1-2회 외식 줄이기',
        weeklySavings,
        monthlySavings: weeklySavings * 4.33,
        difficulty: 'easy',
        category: 'lifestyle',
      });
    }
  }

  return opportunities.sort((a, b) => b.weeklySavings - a.weeklySavings);
}

// Helper functions
function getWeeklyFillUps(frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly'): number {
  switch (frequency) {
    case 'daily': return 7;
    case 'weekly': return 1;
    case 'biweekly': return 0.5;
    case 'monthly': return 0.25;
    default: return 0;
  }
}

function getGasFrequencyLabel(frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly' | null | undefined): string {
  switch (frequency) {
    case 'daily': return '주유 매일';
    case 'weekly': return '주유 주 1회';
    case 'biweekly': return '주유 격주 1회';
    case 'monthly': return '주유 월 1회';
    default: return '주유 빈도 미설정';
  }
}

