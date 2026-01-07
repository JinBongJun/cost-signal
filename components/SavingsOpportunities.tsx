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
    <Card className="mb-10">
      <div className="flex items-center gap-4 mb-8">
        <div className="text-4xl flex-shrink-0">💰</div>
        <div className="flex-1">
          <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 tracking-tight mb-2">
            Savings Opportunities
          </h3>
          <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
            Amount you can save by making small changes to your spending patterns
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {opportunities.map((opp) => {
          const colors = DIFFICULTY_COLORS[opp.difficulty];
          
          return (
            <div
              key={opp.id}
              className={`rounded-2xl p-6 border transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 ${colors.bg} ${colors.border}`}
            >
              <div className="flex items-start gap-4">
                <div className="text-4xl flex-shrink-0">{CATEGORY_ICONS[opp.category]}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${colors.badge}`}>
                      {opp.difficulty === 'easy' ? 'EASY' : opp.difficulty === 'medium' ? 'MEDIUM' : 'HARD'}
                    </span>
                  </div>
                  <h4 className="font-bold text-lg mb-2 text-gray-900 dark:text-gray-100 tracking-tight">
                    {opp.title}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                    {opp.description}
                  </p>
                  
                  <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200/60 dark:border-gray-700/60 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex-1">
                        <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Current</span>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{opp.currentPattern}</span>
                      </div>
                      <div className="text-2xl text-gray-300 dark:text-gray-600 mx-3">→</div>
                      <div className="flex-1 text-right">
                        <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Suggested</span>
                        <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{opp.suggestedChange}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-3 border border-gray-200/60 dark:border-gray-700/60">
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">Weekly</span>
                      <p className="text-xl font-bold text-green-600 dark:text-green-400 tracking-tight">
                        {formatCurrency(opp.weeklySavings)}
                      </p>
                    </div>
                    <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-3 border border-gray-200/60 dark:border-gray-700/60">
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">Monthly</span>
                      <p className="text-xl font-bold text-green-600 dark:text-green-400 tracking-tight">
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

