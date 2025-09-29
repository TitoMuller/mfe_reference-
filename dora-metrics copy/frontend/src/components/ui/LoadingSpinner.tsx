import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from './Button';

// Loading Spinner Component
export const LoadingSpinner = ({ className }: { className?: string }) => (
  <div
    className={cn(
      "animate-spin rounded-full h-4 w-4 border-2 border-gray-600 border-t-blue-500",
      className
    )}
  />
);

// Error Message Component
export const ErrorMessage = ({ 
  message, 
  className,
  onRetry 
}: { 
  message: string;
  className?: string;
  onRetry?: () => void;
}) => (
  <div className={cn("rounded-md bg-red-900/50 border border-red-700 p-4", className)}>
    <div className="text-red-200 text-sm">{message}</div>
    {onRetry && (
      <Button
        variant="outline"
        size="sm"
        onClick={onRetry}
        className="mt-2 border-red-600 text-red-200 hover:bg-red-800"
      >
        Retry
      </Button>
    )}
  </div>
);