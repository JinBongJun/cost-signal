'use client';

import Link from 'next/link';

export function Footer() {
  const appVersion = process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0';
  const buildTime = process.env.NEXT_PUBLIC_BUILD_TIME || '';
  const gitCommit = process.env.NEXT_PUBLIC_GIT_COMMIT || '';

  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 mt-auto">
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-6 md:py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col items-center md:items-start gap-1">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              © {new Date().getFullYear()} Cost Signal. All rights reserved.
            </div>
            {(appVersion || buildTime || gitCommit) && (
              <div className="text-xs text-gray-400 dark:text-gray-500">
                {appVersion && `v${appVersion}`}
                {gitCommit && ` (${gitCommit})`}
                {buildTime && (
                  <>
                    {appVersion && ' • '}
                    Built {new Date(buildTime).toLocaleString('en-US', { 
                      month: 'short', 
                      day: 'numeric', 
                      hour: '2-digit', 
                      minute: '2-digit',
                      timeZoneName: 'short'
                    })}
                  </>
                )}
              </div>
            )}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
            <Link 
              href="/terms" 
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
            >
              Terms
            </Link>
            <Link 
              href="/privacy" 
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
            >
              Privacy
            </Link>
            <Link 
              href="/refund" 
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
            >
              Refund Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

