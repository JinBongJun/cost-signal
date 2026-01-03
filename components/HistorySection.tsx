'use client';

import { Button } from './Button';
import { Card } from './Card';

interface HistorySignal {
  week_start: string;
  overall_status: 'ok' | 'caution' | 'risk';
  risk_count: number;
  explanation: string | null;
  indicators: Array<{
    type: string;
    value: number;
    previous_value: number | null;
    change_percent: number | null;
    status: 'ok' | 'caution' | 'risk';
  }>;
}

interface HistorySectionProps {
  history: HistorySignal[];
  showHistory: boolean;
  onToggle: () => void;
  formatDate: (date: string) => string;
  isLoading?: boolean;
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

export function HistorySection({
  history,
  showHistory,
  onToggle,
  formatDate,
  isLoading = false,
}: HistorySectionProps) {
  return (
    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Historical Signals</h3>
        <Button onClick={onToggle} variant="secondary" size="sm">
          {showHistory ? 'Hide' : 'Show'} History
        </Button>
      </div>

      {showHistory && (
        <div className="space-y-3 animate-fade-in">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-500 dark:text-gray-400 text-sm">Loading history...</p>
            </div>
          ) : history.length > 0 ? (
            history.map((histSignal, idx) => (
              <Card
                key={histSignal.week_start}
                padding="md"
                hover
                className="animate-slide-up border-l-4 hover:animate-pulse-glow transition-all duration-300"
                style={{
                  animationDelay: `${idx * 0.1}s`,
                  borderLeftColor:
                    histSignal.overall_status === 'risk'
                      ? '#dc2626'
                      : histSignal.overall_status === 'caution'
                      ? '#eab308'
                      : '#16a34a',
                }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className={`text-2xl font-bold ${STATUS_COLOR[histSignal.overall_status]}`}>
                        {STATUS_EMOJI[histSignal.overall_status]} {STATUS_LABEL[histSignal.overall_status]}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                        {formatDate(histSignal.week_start)}
                      </span>
                    </div>
                    {histSignal.explanation && (
                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                        {histSignal.explanation}
                      </p>
                    )}
                    {histSignal.indicators && histSignal.indicators.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {histSignal.indicators.map((ind, i) => (
                          <span
                            key={i}
                            className={`text-xs px-3 py-1.5 rounded-full font-medium ${
                              ind.status === 'risk'
                                ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800'
                                : ind.status === 'caution'
                                ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 border border-yellow-200 dark:border-yellow-800'
                                : 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800'
                            }`}
                          >
                            {INDICATOR_LABELS[ind.type] || ind.type}: {ind.status.toUpperCase()}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
              No historical data available yet.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

