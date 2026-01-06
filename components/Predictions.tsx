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
    <Card className="mb-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="text-2xl">🔮</div>
        <h3 className="text-xl md:text-2xl font-semibold tracking-tight">다음 주 예측</h3>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
        현재 트렌드를 기반으로 한 다음 주 예상 변화입니다.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {predictions.map((prediction, idx) => {
          const colors = TIMING_COLORS[prediction.timing];
          
          return (
            <div
              key={idx}
              className={`rounded-xl p-4 border transition-all duration-200 hover:shadow-sm ${colors.bg} ${colors.border}`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{DIRECTION_ICONS[prediction.direction]}</span>
                  <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                    {INDICATOR_LABELS[prediction.indicator]}
                  </span>
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${colors.badge}`}>
                  {prediction.timing === 'optimal' ? '최적' : prediction.timing === 'good' ? '좋음' : '피하기'}
                </span>
              </div>
              
              {prediction.expectedChange !== 0 && (
                <div className="mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    예상 변화: {prediction.expectedChange > 0 ? '+' : ''}{prediction.expectedChange.toFixed(1)}%
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                    (신뢰도: {prediction.confidence === 'high' ? '높음' : prediction.confidence === 'medium' ? '중간' : '낮음'})
                  </span>
                </div>
              )}
              
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {prediction.recommendation}
              </p>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

