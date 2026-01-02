'use client';

import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 mt-auto">
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-6 md:py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            © {new Date().getFullYear()} Cost Signal. All rights reserved.
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

