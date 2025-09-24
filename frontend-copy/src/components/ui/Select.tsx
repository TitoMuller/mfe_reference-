import React from 'react';
import { cn } from '@/lib/utils';

// Simplified Select components for now - you can enhance these later
export const Select = ({ 
  children, 
  value, 
  onValueChange,
  disabled 
}: {
  children: React.ReactNode;
  value?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
}) => {
  return (
    <div className="relative">
      {children}
    </div>
  );
};

export const SelectContent = ({ children, className }: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={cn("absolute z-50 min-w-[8rem] overflow-hidden rounded-md border border-gray-700 bg-gray-800 text-gray-100 shadow-md", className)}>
    {children}
  </div>
);

export const SelectItem = ({ 
  children, 
  value, 
  className,
  onClick 
}: {
  children: React.ReactNode;
  value: string;
  className?: string;
  onClick?: () => void;
}) => (
  <div
    className={cn("relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-gray-700", className)}
    onClick={onClick}
  >
    {children}
  </div>
);

export const SelectTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    children: React.ReactNode;
  }
>(({ className, children, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "flex h-10 w-full items-center justify-between rounded-md border border-gray-600 bg-gray-800 px-3 py-2 text-sm text-gray-100 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500",
      className
    )}
    {...props}
  >
    {children}
  </button>
));
SelectTrigger.displayName = "SelectTrigger";

export const SelectValue = ({ placeholder }: { placeholder?: string }) => (
  <span className="text-gray-400">{placeholder}</span>
);