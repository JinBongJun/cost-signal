'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { ProfileMenu } from './ProfileMenu';
import { ThemeToggle } from './ThemeToggle';

interface HeaderProps {
  hasActiveSubscription?: boolean;
  isSubscribed?: boolean | null; // null = checking, true/false = known state
  onNotificationClick?: () => void;
}

export function Header({ 
  hasActiveSubscription = false, 
  isSubscribed = null,
  onNotificationClick = () => {}
}: HeaderProps) {
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100 hover:opacity-80 transition-opacity">
              Cost Signal
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Link 
              href="/faq" 
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
            >
              FAQ
            </Link>
            <Link 
              href="/feedback" 
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
            >
              Feedback
            </Link>
            <Link 
              href="/learn-more" 
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
            >
              Learn More
            </Link>
            <div className="hidden md:flex items-center gap-2 text-gray-400">|</div>
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
              Refund
            </Link>
            <ThemeToggle />
            {session?.user ? (
              <ProfileMenu
                hasActiveSubscription={hasActiveSubscription}
                isSubscribed={isSubscribed}
                onNotificationClick={onNotificationClick}
              />
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/login">
                  <button className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors min-h-[44px]">
                    Sign In
                  </button>
                </Link>
                <Link href="/signup">
                  <button className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors min-h-[44px]">
                    Sign Up
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}


