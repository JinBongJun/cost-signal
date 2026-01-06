'use client';

import { Card } from './Card';

interface ImpactBreakdownProps {
  totalWeeklyChange: number;
  breakdown: Array<{
    indicator: 'gas' | 'cpi' | 'interest_rate' | 'unemployment';
    impact: number;
    level: 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';
  }>;
}

const INDICATOR_LABELS: Record<string, string> = {
  gas: 'Gas Prices',
  cpi: 'Inflation (CPI)',
  interest_rate: 'Interest Rates',
  unemployment: 'Unemployment',
};

const LEVEL_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  HIGH: {
    bg: 'bg-red-50 dark:bg-red-900/20',
    text: 'text-red-700 dark:text-red-300',
    border: 'border-red-200 dark:border-red-800',
  },
  MEDIUM: {
    bg: 'bg-yellow-50 dark:bg-yellow-900/20',
    text: 'text-yellow-700 dark:text-yellow-300',
    border: 'border-yellow-200 dark:border-yellow-800',
  },
  LOW: {
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    text: 'text-blue-700 dark:text-blue-300',
    border: 'border-blue-200 dark:border-blue-800',
  },
  NONE: {
    bg: 'bg-gray-50 dark:bg-gray-900',
    text: 'text-gray-600 dark:text-gray-400',
    border: 'border-gray-200 dark:border-gray-700',
  },
};

export function ImpactBreakdown({ totalWeeklyChange, breakdown }: ImpactBreakdownProps) {
  const formatCurrency = (amount: number): string => {
    const sign = amount >= 0 ? '+' : '';
    return `${sign}$${Math.abs(amount).toFixed(2)}`;
  };

  return (
    <Card className="mb-8">
      <h3 className="text-2xl md:text-3xl font-semibold mb-6">Your Weekly Cost Impact</h3>
      
      {/* Total Impact */}
      <div className={`rounded-lg p-6 md:p-8 mb-8 ${
        totalWeeklyChange > 0
          ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
          : totalWeeklyChange < 0
          ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
          : 'bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700'
      }`}>
        <div className="text-center">
          <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 mb-2">Expected Weekly Change</p>
          <p className={`text-5xl md:text-6xl lg:text-7xl font-bold ${
            totalWeeklyChange > 0
              ? 'text-red-600 dark:text-red-400'
              : totalWeeklyChange < 0
              ? 'text-green-600 dark:text-green-400'
              : 'text-gray-600 dark:text-gray-400'
          }`}>
            {formatCurrency(totalWeeklyChange)} / week
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Based on your spending pattern
          </p>
        </div>
      </div>

      {/* Breakdown */}
      <div>
        <h4 className="text-lg md:text-xl font-semibold text-gray-700 dark:text-gray-300 mb-6">
          Cost Pressure Breakdown
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {breakdown.map((item) => {
            const colors = LEVEL_COLORS[item.level] || LEVEL_COLORS.NONE;
            
            return (
              <div
                key={item.indicator}
                className={`rounded-lg p-5 md:p-6 border ${colors.bg} ${colors.border}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {INDICATOR_LABELS[item.indicator] || item.indicator}
                    </span>
                    {item.level !== 'NONE' && (
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        item.level === 'HIGH'
                          ? 'bg-red-600 text-white'
                          : item.level === 'MEDIUM'
                          ? 'bg-yellow-600 text-white'
                          : 'bg-blue-600 text-white'
                      }`}>
                        {item.level}
                      </span>
                    )}
                  </div>
                  <span className={`font-semibold ${colors.text}`}>
                    {item.impact !== 0 ? formatCurrency(item.impact) : '—'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}

