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
                className="animate-scale-in"
                style={{ animationDelay: `${idx * 0.05}s` }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`text-xl font-semibold ${STATUS_COLOR[histSignal.overall_status]}`}>
                        {STATUS_EMOJI[histSignal.overall_status]} {STATUS_LABEL[histSignal.overall_status]}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(histSignal.week_start)}
                      </span>
                    </div>
                    {histSignal.explanation && (
                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                        {histSignal.explanation}
                      </p>
                    )}
                    {histSignal.indicators && histSignal.indicators.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {histSignal.indicators.map((ind, i) => (
                          <span
                            key={i}
                            className={`text-xs px-2 py-1 rounded-full ${
                              ind.status === 'risk'
                                ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
                                : ind.status === 'caution'
                                ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200'
                                : 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                            }`}
                          >
                            {ind.type}: {ind.status.toUpperCase()}
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

