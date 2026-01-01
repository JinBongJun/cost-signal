'use client';

import { Header } from '@/components/Header';
import { Card } from '@/components/Card';
import { Suspense } from 'react';

function LearnMoreContent() {
  return (
    <>
      <Header />
      <main className="min-h-screen p-4 md:p-8 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto">
          <Card className="mb-6">
            <div className="text-center mb-6">
              <h1 className="text-3xl md:text-4xl font-bold mb-2">Why Cost Signal?</h1>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                Simple, reliable, and clear - no opinions, just data
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="text-center">
                <div className="text-4xl mb-3">❌</div>
                <h3 className="font-semibold mb-2 text-gray-900 dark:text-gray-100">Other Apps</h3>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 text-left">
                  <li>• Complex charts & graphs</li>
                  <li>• Opinions & predictions</li>
                  <li>• Financial advice</li>
                  <li>• Daily information overload</li>
                  <li>• Subscription required</li>
                </ul>
              </div>

              <div className="text-center">
                <div className="text-4xl mb-3">✅</div>
                <h3 className="font-semibold mb-2 text-gray-900 dark:text-gray-100">Cost Signal</h3>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 text-left">
                  <li>• Simple signal (🟢🟡🔴)</li>
                  <li>• Just data, no opinions</li>
                  <li>• No financial advice</li>
                  <li>• Weekly summary</li>
                  <li>• Free tier available</li>
                </ul>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="text-2xl">💡</div>
                <div>
                  <h4 className="font-semibold mb-1 text-blue-900 dark:text-blue-100">
                    One clear signal. Every Monday. No opinions. Just data.
                  </h4>
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    Track 4 key economic indicators from official U.S. government sources. 
                    Get notified when costs change. Free to start.
                  </p>
                </div>
              </div>
            </div>

            {/* How We Calculate Signals */}
            <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-semibold mb-4 text-center">How We Calculate Signals</h2>
              <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                  <h3 className="font-semibold mb-2 text-gray-900 dark:text-gray-100">📊 Our Process</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Every Monday, we fetch the latest data from official U.S. government sources and calculate a simple signal based on rule-based logic (no AI decision-making).
                  </p>
                  <div className="space-y-2 text-sm">
                    <div>
                      <strong className="text-gray-900 dark:text-gray-100">Gas Prices (EIA):</strong>
                      <span className="text-gray-600 dark:text-gray-400 ml-2">RISK if price rose &gt;10% in one week OR 3+ consecutive weeks of increases</span>
                    </div>
                    <div>
                      <strong className="text-gray-900 dark:text-gray-100">Inflation (BLS):</strong>
                      <span className="text-gray-600 dark:text-gray-400 ml-2">RISK if MoM increase &gt;0.5% OR 2+ consecutive months of increases</span>
                    </div>
                    <div>
                      <strong className="text-gray-900 dark:text-gray-100">Interest Rates (FRED):</strong>
                      <span className="text-gray-600 dark:text-gray-400 ml-2">RISK if rate increased by &gt;0.25% OR 2+ consecutive months of increases</span>
                    </div>
                    <div>
                      <strong className="text-gray-900 dark:text-gray-100">Unemployment (FRED):</strong>
                      <span className="text-gray-600 dark:text-gray-400 ml-2">RISK if unemployment increased by &gt;0.3% in one month OR 2+ consecutive months of increases</span>
                    </div>
                  </div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <h3 className="font-semibold mb-2 text-blue-900 dark:text-blue-100">🎯 Overall Signal</h3>
                  <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                    <li>• <strong>0 risk indicators</strong> → 🟢 OK</li>
                    <li>• <strong>1 risk indicator</strong> → 🟡 CAUTION</li>
                    <li>• <strong>2+ risk indicators</strong> → 🔴 RISK</li>
                  </ul>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </>
  );
}

export default function LearnMorePage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen p-4 md:p-8 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-48 bg-gray-300 dark:bg-gray-700 rounded"></div>
            <div className="h-64 bg-gray-300 dark:bg-gray-700 rounded-lg"></div>
          </div>
        </div>
      </main>
    }>
      <LearnMoreContent />
    </Suspense>
  );
}


