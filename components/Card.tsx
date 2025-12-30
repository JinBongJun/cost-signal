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
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg ${paddings[padding]} ${hover ? 'transition-shadow hover:shadow-xl' : ''} ${className}`}
      style={style}
      {...props}
    >
      {children}
    </div>
  );
}

