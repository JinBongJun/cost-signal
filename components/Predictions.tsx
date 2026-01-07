'use client';

import { Card } from './Card';

interface Prediction {
  indicator: 'gas' | 'cpi' | 'interest_rate' | 'unemployment';
  direction: 'up' | 'down' | 'stable';
  confidence: 'high' | 'medium' | 'low';
  expectedChange: number;
  recommendation: string;
  timing: 'optimal' | 'good' | 'avoid';
}

interface PredictionsProps {
  predictions: Prediction[];
}

const INDICATOR_LABELS: Record<string, string> = {
  gas: '기름값',
  cpi: '인플레이션',
  interest_rate: '금리',
  unemployment: '실업률',
};

const DIRECTION_ICONS = {
  up: '📈',
  down: '📉',
  stable: '➡️',
};

const TIMING_COLORS = {
  optimal: {
    bg: 'bg-green-50 dark:bg-green-900/20',
    border: 'border-green-200 dark:border-green-800',
    text: 'text-green-700 dark:text-green-300',
    badge: 'bg-green-600 text-white',
  },
  good: {
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    border: 'border-blue-200 dark:border-blue-800',
    text: 'text-blue-700 dark:text-blue-300',
    badge: 'bg-blue-600 text-white',
  },
  avoid: {
    bg: 'bg-red-50 dark:bg-red-900/20',
    border: 'border-red-200 dark:border-red-800',
    text: 'text-red-700 dark:text-red-300',
    badge: 'bg-red-600 text-white',
  },
};

export function Predictions({ predictions }: PredictionsProps) {
  if (predictions.length === 0) {
    return null;
  }

  return (
    <Card className="mb-10">
      <div className="flex items-center gap-4 mb-8">
        <div className="text-4xl flex-shrink-0">🔮</div>
        <div className="flex-1">
          <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 tracking-tight mb-2">
            Next Week Predictions
          </h3>
          <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
            Expected changes for next week based on current trends
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {predictions.map((prediction, idx) => {
          const colors = TIMING_COLORS[prediction.timing];
          
          return (
            <div
              key={idx}
              className={`rounded-2xl p-6 border transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 ${colors.bg} ${colors.border}`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{DIRECTION_ICONS[prediction.direction]}</span>
                  <span className="font-bold text-base md:text-lg text-gray-900 dark:text-gray-100 tracking-tight">
                    {INDICATOR_LABELS[prediction.indicator]}
                  </span>
                </div>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${colors.badge}`}>
                  {prediction.timing === 'optimal' ? 'OPTIMAL' : prediction.timing === 'good' ? 'GOOD' : 'AVOID'}
                </span>
              </div>
              
              {prediction.expectedChange !== 0 && (
                <div className="mb-4 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-3 border border-gray-200/60 dark:border-gray-700/60">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Expected Change:
                    </span>
                    <span className="text-base font-bold text-gray-900 dark:text-gray-100">
                      {prediction.expectedChange > 0 ? '+' : ''}{prediction.expectedChange.toFixed(1)}%
                    </span>
                  </div>
                  <div className="mt-2 pt-2 border-t border-gray-200/60 dark:border-gray-700/60">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Confidence: <span className="font-semibold">{prediction.confidence === 'high' ? 'High' : prediction.confidence === 'medium' ? 'Medium' : 'Low'}</span>
                    </span>
                  </div>
                </div>
              )}
              
              <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                {prediction.recommendation}
              </p>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

