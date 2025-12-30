'use client';

import { useState, useRef, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { Button } from './Button';

interface ProfileMenuProps {
  hasActiveSubscription: boolean;
  isSubscribed: boolean;
  onNotificationClick: () => void;
}

export function ProfileMenu({ hasActiveSubscription, isSubscribed, onNotificationClick }: ProfileMenuProps) {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  if (!session?.user) {
    return (
      <div className="flex items-center gap-3">
        <Link href="/login">
          <Button variant="ghost" size="sm" className="min-h-[44px]">
            Sign In
          </Button>
        </Link>
        <Link href="/signup">
          <Button variant="primary" size="sm" className="min-h-[44px]">
            Sign Up
          </Button>
        </Link>
      </div>
    );
  }

  const userInitial = session.user.email?.charAt(0).toUpperCase() || 'U';

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 min-w-[44px] min-h-[44px]"
        aria-label="Profile menu"
        aria-expanded={isOpen}
      >
        {userInitial}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50 animate-fade-in">
          {/* User Info */}
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
              {session.user.email}
            </p>
            {hasActiveSubscription ? (
              <span className="inline-block mt-1 px-2 py-0.5 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded text-xs font-medium">
                Paid
              </span>
            ) : (
              <Link
                href="/pricing"
                className="inline-block mt-1 px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs font-medium hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Upgrade to Paid
              </Link>
            )}
          </div>

          {/* Menu Items */}
          <div className="py-1">
            <Link
              href="/account"
              className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Account
            </Link>
            <button
              onClick={() => {
                onNotificationClick();
                setIsOpen(false);
              }}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              {isSubscribed ? '🔔 Notifications (Enabled)' : '🔕 Notifications (Disabled)'}
            </button>
            <Link
              href="/account/notifications"
              className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Notification Settings
            </Link>
          </div>

          {/* Sign Out */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-1">
            <button
              onClick={() => {
                signOut();
                setIsOpen(false);
              }}
              className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

