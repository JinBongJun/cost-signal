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
    explanation_type?: 'basic' | 'detailed'; // 'basic' for free tier, 'detailed' for paid
    isAdmin?: boolean; // Admin status from API
    indicators?: Array<{
      type: string;
      value?: number;
      previous_value?: number | null;
      change_percent?: number | null;
      status?: 'ok' | 'caution' | 'risk'; // Optional for free tier
      locked?: boolean; // true for free tier locked indicators
      direction?: 'up' | 'down' | 'neutral'; // For free tier: direction only
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

const DATA_SOURCES: Record<string, { name: string; fullName: string; url: string }> = {
  gas: {
    name: 'EIA',
    fullName: 'Energy Information Administration',
    url: 'https://www.eia.gov/',
  },
  cpi: {
    name: 'BLS',
    fullName: 'Bureau of Labor Statistics',
    url: 'https://www.bls.gov/',
  },
  interest_rate: {
    name: 'FRED',
    fullName: 'Federal Reserve Economic Data',
    url: 'https://fred.stlouisfed.org/',
  },
  unemployment: {
    name: 'FRED',
    fullName: 'Federal Reserve Economic Data',
    url: 'https://fred.stlouisfed.org/',
  },
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

      {/* Explanation - Both tiers (basic for free, detailed AI for paid) */}
      {signal.explanation && (
        <div className={`rounded-lg p-4 mb-6 animate-fade-in ${
          tier === 'paid' 
            ? 'bg-gray-50 dark:bg-gray-900' 
            : 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
        }`}>
          <p className={`leading-relaxed ${
            tier === 'paid'
              ? 'text-gray-700 dark:text-gray-300'
              : 'text-blue-800 dark:text-blue-200'
          }`}>
            {signal.explanation}
          </p>
          {tier === 'free' && signal.explanation_type === 'basic' && (
            <p className="text-blue-600 dark:text-blue-300 text-xs mt-3 italic">
              Want more detailed insights? Upgrade for AI-powered analysis with specific indicator breakdowns.
            </p>
          )}
        </div>
      )}

      {/* Individual Indicators - Both tiers (locked for free, unlocked for paid) */}
      {signal.indicators && signal.indicators.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Indicator Details</h3>
            {tier === 'free' && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                🔒 Locked - Upgrade to unlock
              </span>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {signal.indicators.map((indicator, idx) => {
              // Free tier: indicators are locked (no status, no values)
              // Paid tier: indicators are unlocked (full access)
              // Admin users always have access (even if tier is 'free' due to API response)
              // If user has active subscription, indicators should be unlocked
              const isLocked = (indicator.locked || tier === 'free') && !signal.isAdmin && !hasActiveSubscription;
              
              // Free tier: always use gray colors (status hidden)
              // Paid tier: use status-based colors
              const statusColors = isLocked
                ? {
                    risk: 'border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800/50 opacity-75',
                    caution: 'border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800/50 opacity-75',
                    ok: 'border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800/50 opacity-75',
                  }
                : {
                    risk: 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20',
                    caution: 'border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20',
                    ok: 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20',
                  };
              
              const statusTextColors = {
                risk: 'text-red-600 dark:text-red-400',
                caution: 'text-yellow-600 dark:text-yellow-400',
                ok: 'text-green-600 dark:text-green-400',
              };
              
              // Free tier: status is hidden, use 'ok' as default for styling
              const displayStatus = (indicator.status || 'ok') as 'ok' | 'caution' | 'risk';

              return (
                <div
                  key={idx}
                  className={`rounded-lg p-4 border transition-smooth relative overflow-hidden ${
                    isLocked ? 'cursor-pointer hover:border-blue-400 dark:hover:border-blue-600' : 'hover:shadow-md'
                  } ${statusColors[displayStatus]}`}
                  onClick={isLocked ? () => {
                    // Don't redirect if user is admin or has active subscription
                    if (signal.isAdmin || hasActiveSubscription) {
                      return;
                    }
                    if (!session) {
                      window.location.href = '/login?redirect=/pricing';
                    } else {
                      window.location.href = '/pricing';
                    }
                  } : undefined}
                >
                  {isLocked && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-900/60 dark:bg-gray-900/70 rounded-lg z-10 backdrop-blur-sm">
                      <div className="text-center">
                        <div className="text-3xl mb-2">🔒</div>
                        <p className="text-white text-sm font-semibold mb-1">Locked</p>
                        <p className="text-white/80 text-xs">Upgrade to unlock</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-700 dark:text-gray-300">
                        {INDICATOR_LABELS[indicator.type] || indicator.type}
                      </span>
                      {DATA_SOURCES[indicator.type] && !isLocked && (
                        <a
                          href={DATA_SOURCES[indicator.type].url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                          title={DATA_SOURCES[indicator.type].fullName}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {DATA_SOURCES[indicator.type].name}
                        </a>
                      )}
                    </div>
                    {/* Status badge - hidden for free tier (locked indicators) */}
                    {!isLocked && indicator.status && (
                      <span
                        className={`text-xs font-bold px-2 py-1 rounded-full ${
                          indicator.status === 'risk'
                            ? 'bg-red-600 text-white'
                            : indicator.status === 'caution'
                            ? 'bg-yellow-600 text-white'
                            : 'bg-green-600 text-white'
                        }`}
                      >
                        {indicator.status === 'risk'
                          ? 'RISK'
                          : indicator.status === 'caution'
                          ? 'CAUTION'
                          : 'OK'}
                      </span>
                    )}
                  </div>
                  
                  {!isLocked && indicator.value !== undefined ? (
                    <>
                      {/* Paid tier: Full value display */}
                      <div className={`text-3xl font-bold mb-2 ${statusTextColors[displayStatus]}`}>
                        {formatValue(indicator.type, indicator.value)}
                      </div>
                      {indicator.previous_value !== null && indicator.change_percent != null && (
                        <div className={`text-sm font-medium ${
                          indicator.change_percent > 0
                            ? displayStatus === 'risk'
                              ? 'text-red-700 dark:text-red-300'
                              : displayStatus === 'caution'
                              ? 'text-yellow-700 dark:text-yellow-300'
                              : 'text-gray-600 dark:text-gray-400'
                            : 'text-gray-600 dark:text-gray-400'
                        }`}>
                          {indicator.change_percent > 0 ? '↑' : indicator.change_percent < 0 ? '↓' : '→'} {indicator.change_percent > 0 ? '+' : ''}
                          {indicator.change_percent.toFixed(2)}% from previous
                        </div>
                      )}
                      {DATA_SOURCES[indicator.type] && (
                        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                          Data from{' '}
                          <a
                            href={DATA_SOURCES[indicator.type].url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline hover:text-gray-700 dark:hover:text-gray-300"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {DATA_SOURCES[indicator.type].fullName}
                          </a>
                        </div>
                      )}
                    </>
                  ) : isLocked && indicator.direction !== undefined ? (
                    <>
                      {/* Free tier: Direction only (no values) */}
                      <div className="text-2xl font-bold mb-2 text-gray-600 dark:text-gray-400">
                        {indicator.direction === 'up' ? '▲' : indicator.direction === 'down' ? '▼' : '—'}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Direction only - Upgrade to view details
                      </div>
                    </>
                  ) : (
                    <div className="text-gray-400 dark:text-gray-500 text-sm">
                      Value hidden - Upgrade to view
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          {/* Free tier upgrade CTA */}
          {tier === 'free' && (
            <div className="mt-6 text-center">
              <Link href="/pricing">
                <Button variant="primary" className="w-full md:w-auto min-h-[44px]">
                  Unlock All Indicators - Subscribe Now
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

