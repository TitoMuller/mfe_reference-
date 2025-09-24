// frontend/src/lib/utils.ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function to merge Tailwind classes
 * Essential for shadcn/ui component styling
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Date utilities for DORA metrics dashboard
 * FIXED: Now correctly handles UTC dates without timezone shifts
 */
export const dateUtils = {
  /**
   * Format date for display in charts and UI
   * FIXED: Now properly handles UTC dates to prevent day shifts
   */
  formatChartDate: (dateString: string): string => {
    try {
      const date = new Date(dateString);
      
      // Use UTC methods to prevent timezone-related date shifts
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const month = monthNames[date.getUTCMonth()];
      const day = date.getUTCDate();
      
      return `${month} ${day}`;
    } catch (error) {
      console.warn('Invalid date string:', dateString);
      return dateString;
    }
  },

  /**
   * Format date for API requests (ISO string)
   */
  formatApiDate: (date: Date): string => {
    return date.toISOString();
  },

  /**
   * Get date range for time range selector
   */
  getTimeRangesDates: (timeRange: '7d' | '30d' | '90d' | '1y'): { startDate: string; endDate: string } => {
    const now = new Date();
    const endDate = new Date(now);
    endDate.setHours(23, 59, 59, 999);
    
    let startDate: Date;
    
    switch (timeRange) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    startDate.setHours(0, 0, 0, 0);

    return {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    };
  },

  /**
   * Format duration in hours to human readable
   */
  formatDuration: (hours: number): string => {
    if (hours < 1) {
      return `${Math.round(hours * 60)}m`;
    } else if (hours < 24) {
      return `${Math.round(hours * 10) / 10}h`;
    } else {
      const days = Math.floor(hours / 24);
      const remainingHours = Math.round((hours % 24) * 10) / 10;
      return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
    }
  },

  /**
   * Parse date string and return components
   * Helper function for debugging date issues
   */
  parseDateComponents: (dateString: string): {
    utcDate: string;
    localDate: string;
    utcDay: number;
    localDay: number;
  } => {
    const date = new Date(dateString);
    return {
      utcDate: date.toUTCString(),
      localDate: date.toString(),
      utcDay: date.getUTCDate(),
      localDay: date.getDate(),
    };
  },
};

/**
 * Error handling utilities
 */
export const errorUtils = {
  /**
   * Extract user-friendly error message
   */
  getErrorMessage: (error: unknown): string => {
    if (typeof error === 'string') {
      return error;
    }
    
    if (error && typeof error === 'object' && 'message' in error) {
      return String(error.message);
    }
    
    return 'An unexpected error occurred';
  },
};