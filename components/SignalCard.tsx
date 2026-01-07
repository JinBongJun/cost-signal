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
      updated_at?: string; // ISO date string
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
    <Card className="mb-8 animate-scale-in">
      <div className="text-center mb-8">
        <div className="text-8xl mb-6 animate-fade-in">{STATUS_EMOJI[signal.overall_status]}</div>
        <h2 className={`text-4xl md:text-5xl lg:text-6xl font-bold mb-3 tracking-tight ${STATUS_COLOR[signal.overall_status]}`}>
          {STATUS_LABEL[signal.overall_status]}
        </h2>
        <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 font-medium">
          Week of {formatDate(signal.week_start)}
        </p>
      </div>

      {/* Explanation - Both tiers (basic for free, detailed AI for paid) */}
      {signal.explanation && (
        <div className={`rounded-2xl p-6 md:p-8 mb-8 animate-fade-in border ${
          tier === 'paid' 
            ? 'bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-900/30 dark:to-slate-900/30 border-gray-200/60 dark:border-gray-800/40' 
            : 'bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200/60 dark:border-blue-800/40'
        }`}>
          <p className={`text-base md:text-lg leading-relaxed ${
            tier === 'paid'
              ? 'text-gray-700 dark:text-gray-300'
              : 'text-blue-800 dark:text-blue-200'
          }`}>
            {signal.explanation}
          </p>
          {tier === 'free' && signal.explanation_type === 'basic' && (
            <p className="text-blue-600 dark:text-blue-300 text-sm mt-4 font-medium">
              Want more detailed insights? Upgrade for AI-powered analysis with specific indicator breakdowns.
            </p>
          )}
        </div>
      )}

      {/* Individual Indicators - Both tiers (locked for free, unlocked for paid) */}
      {signal.indicators && signal.indicators.length > 0 && (
        <div className="mt-10 pt-10 border-t border-gray-200/60 dark:border-gray-700/60">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">Indicator Details</h3>
            {tier === 'free' && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                🔒 Locked - Upgrade to unlock
              </span>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {signal.indicators.map((indicator, idx) => {
              // Free tier: indicators are locked (no status, no values)
              // Paid tier: indicators are unlocked (full access)
              // Admin users always have access (even if tier is 'free' due to API response)
              // If user has active subscription, indicators should be unlocked
              // Admin or paid tier users should never see locked indicators
              const effectiveTier = signal.isAdmin ? 'paid' : tier;
              const isLocked = effectiveTier === 'free' && !signal.isAdmin && !hasActiveSubscription;
              
              // Debug logging
              if (idx === 0) {
                console.log('SignalCard - Indicator lock check:', {
                  tier,
                  effectiveTier,
                  signalIsAdmin: signal.isAdmin,
                  hasActiveSubscription,
                  isLocked,
                  indicatorLocked: indicator.locked
                });
              }
              
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
                  className={`rounded-2xl p-6 md:p-7 border transition-all duration-300 relative overflow-hidden ${
                    isLocked ? 'cursor-pointer hover:border-blue-400 dark:hover:border-blue-600' : 'hover:shadow-lg hover:-translate-y-1'
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
                  <div className="flex items-center justify-between mb-4 relative z-20">
                    <div className="flex items-center gap-2.5">
                      <span className="font-bold text-base md:text-lg text-gray-900 dark:text-gray-100 tracking-tight">
                        {INDICATOR_LABELS[indicator.type] || indicator.type}
                      </span>
                      {DATA_SOURCES[indicator.type] && !isLocked && (
                        <a
                          href={DATA_SOURCES[indicator.type].url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs px-2.5 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-full hover:bg-blue-200 dark:hover:bg-blue-900/60 transition-all duration-200 font-medium"
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
                      <div className={`text-4xl md:text-5xl font-bold mb-3 tracking-tight ${statusTextColors[displayStatus]} relative z-20`}>
                        {formatValue(indicator.type, indicator.value)}
                      </div>
                      {indicator.previous_value !== null && indicator.change_percent != null && (
                        <div className={`text-sm md:text-base font-semibold relative z-20 mb-3 ${
                          indicator.change_percent > 0
                            ? displayStatus === 'risk'
                              ? 'text-red-700 dark:text-red-300'
                              : displayStatus === 'caution'
                              ? 'text-yellow-700 dark:text-yellow-300'
                              : 'text-gray-600 dark:text-gray-400'
                            : 'text-gray-600 dark:text-gray-400'
                        }`}>
                          <span className="text-lg">
                            {indicator.change_percent > 0 ? '↑' : indicator.change_percent < 0 ? '↓' : '→'}
                          </span>
                          <span className="ml-1">
                            {indicator.change_percent > 0 ? '+' : ''}{indicator.change_percent.toFixed(2)}%
                          </span>
                          <span className="text-xs font-normal text-gray-500 dark:text-gray-400 ml-2">
                            from previous
                          </span>
                        </div>
                      )}
                      {DATA_SOURCES[indicator.type] && (
                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 relative z-20">
                          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                            <div>
                              <span>Source: </span>
                              <a
                                href={DATA_SOURCES[indicator.type].url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="underline hover:text-gray-700 dark:hover:text-gray-300 font-medium"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {DATA_SOURCES[indicator.type].name}
                              </a>
                              <span className="text-gray-400 dark:text-gray-500 ml-1">
                                ({DATA_SOURCES[indicator.type].fullName})
                              </span>
                            </div>
                            {indicator.updated_at && (
                              <div className="text-xs">
                                Updated: {new Date(indicator.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </>
                  ) : isLocked && indicator.direction !== undefined ? (
                    <>
                      {/* Free tier: Direction only (no values) - Show above overlay */}
                      <div className="text-3xl font-bold mb-2 text-gray-700 dark:text-gray-200 relative z-20">
                        {indicator.direction === 'up' ? '▲' : indicator.direction === 'down' ? '▼' : '—'}
                        {indicator.change_percent != null && (
                          <span className="text-lg ml-2 text-gray-600 dark:text-gray-300">
                            {indicator.change_percent > 0 ? '+' : ''}{Math.abs(indicator.change_percent).toFixed(1)}%
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 relative z-20">
                        Direction only - Upgrade to view details
                      </div>
                    </>
                  ) : (
                    <div className="text-gray-400 dark:text-gray-500 text-sm relative z-20">
                      Value hidden - Upgrade to view
                    </div>
                  )}

                  {isLocked && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-900/40 dark:bg-gray-900/50 rounded-lg z-10 backdrop-blur-sm pointer-events-none">
                      <div className="text-center opacity-60">
                        <div className="text-2xl mb-1">🔒</div>
                        <p className="text-white text-xs font-medium">Locked</p>
                      </div>
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

