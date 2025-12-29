'use client';

import { Card } from './Card';
import { Button } from './Button';
import Link from 'next/link';

interface SignalCardProps {
  signal: {
    week_start: string;
    overall_status: 'ok' | 'caution' | 'risk';
    risk_count: number;
    explanation?: string | null;
    indicators?: Array<{
      type: string;
      value: number;
      previous_value: number | null;
      change_percent: number | null;
      status: 'ok' | 'caution' | 'risk';
    }>;
  };
  tier: 'free' | 'paid';
  session: any;
  hasActiveSubscription: boolean;
  onPreviewClick: () => void;
  formatDate: (date: string) => string;
  formatValue: (type: string, value: number) => string;
}

const STATUS_EMOJI: Record<string, string> = {
  ok: '🟢',
  caution: '🟡',
  risk: '🔴',
};

const STATUS_LABEL: Record<string, string> = {
  ok: 'OK',
  caution: 'CAUTION',
  risk: 'RISK',
};

const STATUS_COLOR: Record<string, string> = {
  ok: 'text-green-600 dark:text-green-400',
  caution: 'text-yellow-600 dark:text-yellow-400',
  risk: 'text-red-600 dark:text-red-400',
};

const INDICATOR_LABELS: Record<string, string> = {
  gas: 'Gas Prices',
  cpi: 'Inflation (CPI)',
  interest_rate: 'Interest Rates',
  unemployment: 'Unemployment',
};

export function SignalCard({
  signal,
  tier,
  session,
  hasActiveSubscription,
  onPreviewClick,
  formatDate,
  formatValue,
}: SignalCardProps) {
  return (
    <Card className="mb-6 animate-scale-in">
      <div className="text-center mb-6">
        <div className="text-6xl mb-4 animate-fade-in">{STATUS_EMOJI[signal.overall_status]}</div>
        <h2 className={`text-3xl md:text-4xl font-bold mb-2 ${STATUS_COLOR[signal.overall_status]}`}>
          {STATUS_LABEL[signal.overall_status]}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Week of {formatDate(signal.week_start)}
        </p>
      </div>

      {/* Explanation - Paid tier only */}
      {tier === 'paid' && signal.explanation && (
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mb-6 animate-fade-in">
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{signal.explanation}</p>
        </div>
      )}

      {/* Free tier upgrade prompt */}
      {tier === 'free' && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6 animate-fade-in">
          <p className="text-blue-800 dark:text-blue-200 text-sm mb-2">
            <strong>Want to understand why?</strong>
          </p>
          <p className="text-blue-700 dark:text-blue-300 text-sm mb-3">
            Upgrade to see detailed explanations, indicator breakdowns, and historical trends.
          </p>
          <div className="flex gap-2 flex-wrap">
            <Button onClick={onPreviewClick} variant="primary" size="sm">
              Preview: View Paid Features
            </Button>
            <Link href="/pricing">
              <Button variant="secondary" size="sm">
                Subscribe Now
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Individual Indicators (Paid tier only) */}
      {tier === 'paid' && (
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4">Indicator Details</h3>
          {signal.indicators && signal.indicators.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {signal.indicators.map((indicator, idx) => (
                <div
                  key={idx}
                  className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 transition-smooth hover:shadow-md"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      {INDICATOR_LABELS[indicator.type] || indicator.type}
                    </span>
                    <span
                      className={`text-sm font-semibold ${
                        indicator.status === 'risk'
                          ? 'text-red-600 dark:text-red-400'
                          : indicator.status === 'caution'
                          ? 'text-yellow-600 dark:text-yellow-400'
                          : 'text-green-600 dark:text-green-400'
                      }`}
                    >
                      {indicator.status === 'risk'
                        ? 'RISK'
                        : indicator.status === 'caution'
                        ? 'CAUTION'
                        : 'OK'}
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                    {formatValue(indicator.type, indicator.value)}
                  </div>
                  {indicator.previous_value !== null && indicator.change_percent !== null && (
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {indicator.change_percent > 0 ? '+' : ''}
                      {indicator.change_percent.toFixed(2)}% from previous
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                <strong>Preview Mode:</strong> A subscription is required to view detailed information for
                individual indicators.
              </p>
              <Link href="/pricing">
                <Button variant="primary" size="sm" className="mt-3">
                  Subscribe
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

