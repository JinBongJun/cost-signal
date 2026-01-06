'use client';

import { Card } from './Card';

interface SavingsOpportunity {
  id: string;
  title: string;
  description: string;
  currentPattern: string;
  suggestedChange: string;
  weeklySavings: number;
  monthlySavings: number;
  difficulty: 'easy' | 'medium' | 'hard';
  category: 'transport' | 'shopping' | 'debt' | 'lifestyle';
}

interface SavingsOpportunitiesProps {
  opportunities: SavingsOpportunity[];
}

const DIFFICULTY_COLORS = {
  easy: {
    bg: 'bg-green-50 dark:bg-green-900/20',
    border: 'border-green-200 dark:border-green-800',
    badge: 'bg-green-600 text-white',
  },
  medium: {
    bg: 'bg-yellow-50 dark:bg-yellow-900/20',
    border: 'border-yellow-200 dark:border-yellow-800',
    badge: 'bg-yellow-600 text-white',
  },
  hard: {
    bg: 'bg-orange-50 dark:bg-orange-900/20',
    border: 'border-orange-200 dark:border-orange-800',
    badge: 'bg-orange-600 text-white',
  },
};

const CATEGORY_ICONS = {
  transport: '🚗',
  shopping: '🛒',
  debt: '💳',
  lifestyle: '🏠',
};

export function SavingsOpportunities({ opportunities }: SavingsOpportunitiesProps) {
  if (opportunities.length === 0) {
    return null;
  }

  const formatCurrency = (amount: number): string => {
    return `$${Math.abs(amount).toFixed(2)}`;
  };

  return (
    <Card className="mb-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="text-2xl">💰</div>
        <h3 className="text-xl md:text-2xl font-semibold tracking-tight">절약 기회</h3>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
        소비 패턴을 조금만 바꾸면 절약할 수 있는 금액입니다.
      </p>
      
      <div className="space-y-4">
        {opportunities.map((opp) => {
          const colors = DIFFICULTY_COLORS[opp.difficulty];
          
          return (
            <div
              key={opp.id}
              className={`rounded-xl p-5 border transition-all duration-200 hover:shadow-md ${colors.bg} ${colors.border}`}
            >
              <div className="flex items-start gap-4">
                <div className="text-3xl flex-shrink-0">{CATEGORY_ICONS[opp.category]}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${colors.badge}`}>
                      {opp.difficulty === 'easy' ? '쉬움' : opp.difficulty === 'medium' ? '보통' : '어려움'}
                    </span>
                  </div>
                  <h4 className="font-semibold text-base mb-1 text-gray-900 dark:text-gray-100">
                    {opp.title}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {opp.description}
                  </p>
                  
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700 mb-3">
                    <div className="flex items-center justify-between text-sm">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">현재: </span>
                        <span className="text-gray-700 dark:text-gray-300">{opp.currentPattern}</span>
                      </div>
                      <div className="text-gray-400">→</div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">제안: </span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">{opp.suggestedChange}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">주간 절약</span>
                      <p className="text-lg font-bold text-green-600 dark:text-green-400">
                        {formatCurrency(opp.weeklySavings)}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">월간 절약</span>
                      <p className="text-lg font-bold text-green-600 dark:text-green-400">
                        {formatCurrency(opp.monthlySavings)}
                      </p>
                    </div>
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

