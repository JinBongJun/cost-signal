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
    <Card className="mb-10">
      <div className="flex items-center gap-4 mb-8">
        <div className="text-4xl flex-shrink-0">💡</div>
        <div className="flex-1">
          <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 tracking-tight mb-2">
            Actionable Insights
          </h3>
          <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
            Ways to save money in response to this week's economic changes
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {insights.map((insight) => {
          const colors = PRIORITY_COLORS[insight.priority];
          
          return (
            <div
              key={insight.id}
              className={`rounded-2xl p-6 border transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 ${colors.bg} ${colors.border}`}
            >
              <div className="flex items-start gap-4">
                <div className="text-4xl flex-shrink-0">{insight.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${colors.badge}`}>
                      {insight.priority.toUpperCase()}
                    </span>
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                      {URGENCY_LABELS[insight.urgency]}
                    </span>
                  </div>
                  <h4 className="font-bold text-lg mb-2 text-gray-900 dark:text-gray-100 tracking-tight">
                    {insight.title}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 leading-relaxed">
                    {insight.description}
                  </p>
                  <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200/60 dark:border-gray-700/60 mb-4">
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 leading-relaxed">
                      {insight.action}
                    </p>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-base font-bold text-green-600 dark:text-green-400">
                      {formatCurrency(insight.potentialSavings)}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      /week
                    </span>
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      ({formatCurrency(insight.potentialSavings * 4.33)}/month)
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

