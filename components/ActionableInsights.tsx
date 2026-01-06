'use client';

import { Card } from './Card';

interface ActionableInsight {
  id: string;
  type: 'gas' | 'cpi' | 'interest_rate' | 'general';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  action: string;
  potentialSavings: number;
  urgency: 'now' | 'this_week' | 'soon';
  icon: string;
}

interface ActionableInsightsProps {
  insights: ActionableInsight[];
}

const PRIORITY_COLORS = {
  high: {
    bg: 'bg-red-50 dark:bg-red-900/20',
    border: 'border-red-200 dark:border-red-800',
    text: 'text-red-700 dark:text-red-300',
    badge: 'bg-red-600 text-white',
  },
  medium: {
    bg: 'bg-yellow-50 dark:bg-yellow-900/20',
    border: 'border-yellow-200 dark:border-yellow-800',
    text: 'text-yellow-700 dark:text-yellow-300',
    badge: 'bg-yellow-600 text-white',
  },
  low: {
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    border: 'border-blue-200 dark:border-blue-800',
    text: 'text-blue-700 dark:text-blue-300',
    badge: 'bg-blue-600 text-white',
  },
};

const URGENCY_LABELS = {
  now: '지금',
  this_week: '이번 주',
  soon: '곧',
};

export function ActionableInsights({ insights }: ActionableInsightsProps) {
  if (insights.length === 0) {
    return null;
  }

  const formatCurrency = (amount: number): string => {
    return `$${Math.abs(amount).toFixed(2)}`;
  };

  return (
    <Card className="mb-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="text-2xl">💡</div>
        <h3 className="text-xl md:text-2xl font-semibold tracking-tight">액션 가능한 인사이트</h3>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
        이번 주 경제 변화에 대응하여 돈을 절약할 수 있는 방법입니다.
      </p>
      
      <div className="space-y-4">
        {insights.map((insight) => {
          const colors = PRIORITY_COLORS[insight.priority];
          
          return (
            <div
              key={insight.id}
              className={`rounded-xl p-5 border transition-all duration-200 hover:shadow-md ${colors.bg} ${colors.border}`}
            >
              <div className="flex items-start gap-4">
                <div className="text-3xl flex-shrink-0">{insight.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${colors.badge}`}>
                      {insight.priority.toUpperCase()}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {URGENCY_LABELS[insight.urgency]}
                    </span>
                  </div>
                  <h4 className="font-semibold text-base mb-1 text-gray-900 dark:text-gray-100">
                    {insight.title}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {insight.description}
                  </p>
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700 mb-3">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {insight.action}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                      주간 절약: {formatCurrency(insight.potentialSavings)}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      (월 {formatCurrency(insight.potentialSavings * 4.33)})
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

