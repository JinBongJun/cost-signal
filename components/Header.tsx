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
      <div className="w-full mx-auto px-6 md:px-12 py-4 md:py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100 hover:opacity-80 transition-opacity">
              Cost Signal
            </Link>
          </div>
          <div className="flex items-center gap-6 md:gap-8">
            <Link 
              href="/faq" 
              className="text-base md:text-lg text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors font-medium"
            >
              FAQ
            </Link>
            <Link 
              href="/feedback" 
              className="text-base md:text-lg text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors font-medium"
            >
              Feedback
            </Link>
            <Link 
              href="/learn-more" 
              className="text-base md:text-lg text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors font-medium"
            >
              Learn More
            </Link>
            <ThemeToggle />
            {session?.user ? (
              <ProfileMenu
                hasActiveSubscription={hasActiveSubscription}
                isSubscribed={isSubscribed}
                onNotificationClick={onNotificationClick}
              />
            ) : (
              <div className="flex items-center gap-4">
                <Link href="/login">
                  <button className="px-6 py-3 text-base md:text-lg text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors min-h-[52px] font-medium">
                    Sign In
                  </button>
                </Link>
                <Link href="/signup">
                  <button className="px-6 py-3 text-base md:text-lg bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors min-h-[52px] font-semibold">
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


