'use client';

import { Card } from './Card';

interface ActionableInsight {
  potentialSavings: number;
}

interface SavingsOpportunity {
  weeklySavings: number;
  monthlySavings: number;
}

interface ROISummaryProps {
  insights?: ActionableInsight[];
  savingsOpportunities?: SavingsOpportunity[];
}

const MONTHLY_SUBSCRIPTION_COST = 4.99;
const YEARLY_SUBSCRIPTION_COST = 39.99 / 12; // Monthly equivalent

export function ROISummary({ insights = [], savingsOpportunities = [] }: ROISummaryProps) {
  // Calculate total weekly savings from insights
  const totalWeeklySavingsFromInsights = insights.reduce((sum, insight) => sum + insight.potentialSavings, 0);
  
  // Calculate total weekly savings from opportunities
  const totalWeeklySavingsFromOpportunities = savingsOpportunities.reduce((sum, opp) => sum + opp.weeklySavings, 0);
  
  // Total weekly savings
  const totalWeeklySavings = totalWeeklySavingsFromInsights + totalWeeklySavingsFromOpportunities;
  
  // Calculate monthly and yearly savings
  const monthlySavings = totalWeeklySavings * 4.33;
  const yearlySavings = monthlySavings * 12;
  
  // Calculate ROI
  const monthlyROI = monthlySavings > 0 ? ((monthlySavings / MONTHLY_SUBSCRIPTION_COST) * 100) : 0;
  const yearlyROI = yearlySavings > 0 ? ((yearlySavings / YEARLY_SUBSCRIPTION_COST) * 100) : 0;
  
  // If no savings, don't show the component
  if (totalWeeklySavings <= 0) {
    return null;
  }

  const formatCurrency = (amount: number): string => {
    return `$${Math.abs(amount).toFixed(2)}`;
  };

  return (
    <Card className="mb-8 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-green-900/10 dark:via-emerald-900/10 dark:to-teal-900/10 border border-green-200/60 dark:border-green-800/40">
      <div className="flex items-start gap-5 mb-8">
        <div className="text-5xl flex-shrink-0">💰</div>
        <div className="flex-1">
          <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2 tracking-tight">
            This Week's Savings Potential
          </h3>
          <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
            Based on actionable insights and savings opportunities
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/60 dark:border-gray-700/60 hover:border-green-300 dark:hover:border-green-700 transition-all duration-200">
          <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">Weekly Savings</div>
          <div className="text-3xl md:text-4xl font-bold text-green-600 dark:text-green-400 tracking-tight">
            {formatCurrency(totalWeeklySavings)}
          </div>
        </div>
        
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/60 dark:border-gray-700/60 hover:border-green-300 dark:hover:border-green-700 transition-all duration-200">
          <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">Monthly Savings</div>
          <div className="text-3xl md:text-4xl font-bold text-green-600 dark:text-green-400 tracking-tight">
            {formatCurrency(monthlySavings)}
          </div>
        </div>
        
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/60 dark:border-gray-700/60 hover:border-green-300 dark:hover:border-green-700 transition-all duration-200">
          <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">Yearly Savings</div>
          <div className="text-3xl md:text-4xl font-bold text-green-600 dark:text-green-400 tracking-tight">
            {formatCurrency(yearlySavings)}
          </div>
        </div>
      </div>
      
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-6 border border-blue-200/60 dark:border-blue-800/40">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-1.5">
              Subscription ROI
            </div>
            <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              {formatCurrency(monthlySavings)} monthly savings vs {formatCurrency(MONTHLY_SUBSCRIPTION_COST)} subscription
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl md:text-4xl font-bold text-blue-600 dark:text-blue-400 tracking-tight">
              {monthlyROI.toFixed(0)}%
            </div>
            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-1">
              {monthlyROI >= 100 ? '✨ Great value!' : 'Good value'}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

