'use client';

import { ReactNode, CSSProperties, HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
  hover?: boolean;
  style?: CSSProperties;
  id?: string;
}

export function Card({ children, className = '', padding = 'md', hover = false, style, id, ...props }: CardProps) {
  const paddings = {
    sm: 'p-4',
    md: 'p-6 md:p-8',
    lg: 'p-8 md:p-12',
  };

  return (
    <div
      id={id}
      className={`bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/80 dark:border-gray-800/80 ${paddings[padding]} ${
        hover 
          ? 'transition-all duration-300 hover:border-gray-300 dark:hover:border-gray-700 hover:shadow-lg hover:-translate-y-0.5' 
          : ''
      } ${className}`}
      style={{
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05), 0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}

