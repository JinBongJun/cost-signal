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
    <Card className="mb-10">
      <div className="flex items-center gap-3 mb-8">
        <div className="text-3xl">💸</div>
        <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">Weekly Cost Impact</h3>
      </div>
      
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
      <div className={`rounded-2xl p-8 md:p-10 mb-8 border-2 ${
        totalWeeklyChange > 0
          ? 'bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-red-300/60 dark:border-red-800/40'
          : totalWeeklyChange < 0
          ? 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-300/60 dark:border-green-800/40'
          : 'bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-900/50 dark:to-slate-900/50 border-gray-300/60 dark:border-gray-800/40'
      }`}>
        <div className="text-center">
          <p className="text-sm md:text-base font-medium text-gray-600 dark:text-gray-400 mb-3 uppercase tracking-wide">Expected Weekly Change</p>
          <p className={`text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight ${
            totalWeeklyChange > 0
              ? 'text-red-600 dark:text-red-400'
              : totalWeeklyChange < 0
              ? 'text-green-600 dark:text-green-400'
              : 'text-gray-600 dark:text-gray-400'
          }`}>
            {formatCurrency(totalWeeklyChange)}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-3 font-medium">
            per week
          </p>
        </div>
      </div>

      {/* Breakdown */}
      <div>
        <h4 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6 tracking-tight">
          Cost Pressure Breakdown
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {breakdown.map((item) => {
            const colors = LEVEL_COLORS[item.level] || LEVEL_COLORS.NONE;
            
            return (
              <div
                key={item.indicator}
                className={`rounded-2xl p-6 border transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 ${colors.bg} ${colors.border}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="font-semibold text-gray-900 dark:text-gray-100 text-base md:text-lg">
                        {INDICATOR_LABELS[item.indicator] || item.indicator}
                      </span>
                      {item.level !== 'NONE' && (
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
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
                      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                        {item.context}
                      </p>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className={`text-2xl md:text-3xl font-bold tracking-tight ${colors.text}`}>
                      {item.impact !== 0 ? formatCurrency(item.impact) : '—'}
                    </span>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">/ week</p>
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

