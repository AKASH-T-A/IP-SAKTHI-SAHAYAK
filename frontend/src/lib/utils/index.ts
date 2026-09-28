/**
 * IP-SAKTI — cn() utility
 * Merges class names using clsx + tailwind-merge.
 */
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a date string for display.
 */
export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Truncate a string to n characters.
 */
export function truncate(str: string, n: number): string {
  return str.length > n ? str.slice(0, n) + '…' : str;
}

/**
 * Get jurisdiction display label.
 */
export function jurisdictionLabel(j: string): string {
  const map: Record<string, string> = {
    India: '🇮🇳 India',
    International: '🌐 International',
    EU: '🇪🇺 EU',
    US: '🇺🇸 US',
  };
  return map[j] || j;
}
