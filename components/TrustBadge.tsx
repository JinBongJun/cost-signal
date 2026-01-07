'use client';

import { Card } from './Card';

export function TrustBadge() {
  return (
    <Card className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-green-900/10 dark:via-emerald-900/10 dark:to-teal-900/10 border border-green-200/60 dark:border-green-800/40">
      <div className="flex items-center gap-5 py-5">
        <div className="text-4xl flex-shrink-0">✅</div>
        <div className="flex-1">
          <h4 className="text-base md:text-lg font-bold text-gray-900 dark:text-gray-100 mb-2 tracking-tight">
            Verified Government Data
          </h4>
          <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
            All data comes directly from official U.S. government sources:{' '}
            <a
              href="https://www.eia.gov/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold underline hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              EIA
            </a>
            {', '}
            <a
              href="https://www.bls.gov/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold underline hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              BLS
            </a>
            {', '}
            <a
              href="https://fred.stlouisfed.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold underline hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              FRED
            </a>
          </p>
        </div>
      </div>
    </Card>
  );
}

