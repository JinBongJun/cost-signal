'use client';

import { ReactNode } from 'react';

interface ThemeProviderProps {
  children: ReactNode;
  attribute?: string;
  defaultTheme?: string;
  enableSystem?: boolean;
}

// Minimal ThemeProvider to keep layout working without external dependencies.
// It simply renders children and ignores theme-related props.
export function ThemeProvider({ children }: ThemeProviderProps) {
  return <>{children}</>;
}


