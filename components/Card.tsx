'use client';

import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
  hover?: boolean;
}

export function Card({ children, className = '', padding = 'md', hover = false }: CardProps) {
  const paddings = {
    sm: 'p-4',
    md: 'p-6 md:p-8',
    lg: 'p-8 md:p-12',
  };

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg ${paddings[padding]} ${hover ? 'transition-shadow hover:shadow-xl' : ''} ${className}`}
    >
      {children}
    </div>
  );
}

