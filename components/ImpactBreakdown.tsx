'use client';

import { Card } from './Card';
import { SpendingPattern } from '@/lib/types';
import Link from 'next/link';

interface ImpactBreakdownProps {
  totalWeeklyChange: number;
  breakdown: Array<{
    indicator: 'gas' | 'cpi' | 'interest_rate' | 'unemployment';
    impact: number;
    level: 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';
    context?: string;
  }>;
  spendingPattern?: SpendingPattern;
  averageImpact?: {
    totalWeeklyChange: number;
    breakdown: Array<{
      indicator: 'gas' | 'cpi' | 'interest_rate' | 'unemployment';
      impact: number;
      level: 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';
    }>;
  };
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

export function ImpactBreakdown({ 
  totalWeeklyChange, 
  breakdown, 
  spendingPattern,
  averageImpact 
}: ImpactBreakdownProps) {
  const formatCurrency = (amount: number): string => {
    const sign = amount >= 0 ? '+' : '';
    return `${sign}$${Math.abs(amount).toFixed(2)}`;
  };

  // Format spending pattern for display
  const formatSpendingPattern = (): string => {
    if (!spendingPattern) return '';
    
    const parts: string[] = [];
    
    if (spendingPattern.gas_frequency) {
      const gasLabels: Record<string, string> = {
        daily: '주유 매일',
        weekly: '주유 주 1회',
        biweekly: '주유 격주 1회',
        monthly: '주유 월 1회',
      };
      parts.push(gasLabels[spendingPattern.gas_frequency] || spendingPattern.gas_frequency);
    }
    
    if (spendingPattern.monthly_rent) {
      parts.push(`월 렌트 $${spendingPattern.monthly_rent.toLocaleString()}`);
    }
    
    if (spendingPattern.transport_mode) {
      const transportLabels: Record<string, string> = {
        car: '자차',
        public: '대중교통',
        mixed: '혼합',
      };
      parts.push(transportLabels[spendingPattern.transport_mode] || spendingPattern.transport_mode);
    }
    
    if (spendingPattern.has_debt) {
      parts.push('대출 있음');
    }
    
    return parts.join(', ');
  };

  const spendingPatternText = formatSpendingPattern();
  const differenceFromAverage = averageImpact 
    ? totalWeeklyChange - averageImpact.totalWeeklyChange 
    : null;

  return (
    <Card className="mb-8">
      <h3 className="text-xl md:text-2xl font-semibold mb-6 tracking-tight">Your Weekly Cost Impact</h3>
      
      {/* Settings Display */}
      {spendingPatternText && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <div className="text-xl">📋</div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Based on your settings:
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {spendingPatternText}
              </p>
              <Link href="/account" className="text-xs text-blue-600 dark:text-blue-400 hover:underline mt-1 inline-block">
                Edit settings →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Comparison with Average */}
      {averageImpact && differenceFromAverage !== null && (
        <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">평균 사용자</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {formatCurrency(averageImpact.totalWeeklyChange)} / week
              </p>
            </div>
            <div className="text-2xl text-gray-300 dark:text-gray-600">vs</div>
            <div className="text-right">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">내 기준</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {formatCurrency(totalWeeklyChange)} / week
              </p>
            </div>
          </div>
          {Math.abs(differenceFromAverage) > 0.01 && (
            <div className={`mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 text-center ${
              differenceFromAverage > 0 
                ? 'text-red-600 dark:text-red-400' 
                : 'text-green-600 dark:text-green-400'
            }`}>
              <p className="text-sm font-medium">
                평균보다 {differenceFromAverage > 0 ? '더' : '덜'} {formatCurrency(Math.abs(differenceFromAverage))} 영향받음
              </p>
            </div>
          )}
        </div>
      )}

      {/* Total Impact */}
      <div className={`rounded-xl p-6 md:p-8 mb-8 border ${
        totalWeeklyChange > 0
          ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
          : totalWeeklyChange < 0
          ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
          : 'bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800'
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
        <div className="space-y-4">
          {breakdown.map((item) => {
            const colors = LEVEL_COLORS[item.level] || LEVEL_COLORS.NONE;
            
            return (
              <div
                key={item.indicator}
                className={`rounded-xl p-5 md:p-6 border transition-all duration-200 hover:shadow-sm ${colors.bg} ${colors.border}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold text-gray-900 dark:text-gray-100 text-base">
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
                    {item.context && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {item.context}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <span className={`text-xl font-bold ${colors.text}`}>
                      {item.impact !== 0 ? formatCurrency(item.impact) : '—'}
                    </span>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">/ week</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}

