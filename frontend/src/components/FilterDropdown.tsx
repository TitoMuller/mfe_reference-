import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui';
import { cn } from '@/lib/utils';

interface FilterDropdownProps {
  label: string;
  value?: string;
  options: string[];
  onChange: (value: string | undefined) => void;
  loading?: boolean;
  placeholder?: string;
  disabled?: boolean;
}

/**
 * FilterDropdown Component
 * 
 * Custom dropdown component that matches the design in your screenshot.
 * Features:
 * - Dark theme styling
 * - Loading states
 * - Clear selection option
 * - Click outside to close
 * - Keyboard navigation
 */
export const FilterDropdown: React.FC<FilterDropdownProps> = ({
  label,
  value,
  options,
  onChange,
  loading = false,
  placeholder = "Select option",
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  /**
   * Close dropdown when clicking outside
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  /**
   * Handle keyboard navigation
   */
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      setIsOpen(false);
    }
  };

  /**
   * Handle option selection
   */
  const handleSelect = (selectedValue: string) => {
    if (selectedValue === value) {
      // Deselect if clicking the same option
      onChange(undefined);
    } else {
      onChange(selectedValue);
    }
    setIsOpen(false);
  };

  /**
   * Clear selection
   */
  const handleClear = () => {
    onChange(undefined);
    setIsOpen(false);
  };

  const displayValue = value || placeholder;
  const hasSelection = Boolean(value);

  return (
    <div className="flex flex-col">
      <label className="text-sm text-gray-400 mb-1">{label}</label>
      
      <div className="relative" ref={dropdownRef}>
        {/* Trigger Button */}
        <button
          type="button"
          className={cn(
            "flex h-10 w-full min-w-[160px] items-center justify-between rounded-md border bg-gray-800 px-3 py-2 text-sm transition-colors",
            "border-gray-600 text-gray-100 hover:bg-gray-700",
            "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900",
            disabled && "opacity-50 cursor-not-allowed",
            isOpen && "ring-2 ring-blue-500"
          )}
          onClick={() => !disabled && !loading && setIsOpen(!isOpen)}
          onKeyDown={handleKeyDown}
          disabled={disabled || loading}
        >
          <span className={cn(
            "truncate",
            !hasSelection && "text-gray-400"
          )}>
            {loading ? (
              <div className="flex items-center gap-2">
                <LoadingSpinner className="h-4 w-4" />
                Loading...
              </div>
            ) : (
              displayValue
            )}
          </span>
          
          <ChevronDown 
            className={cn(
              "h-4 w-4 transition-transform text-gray-400",
              isOpen && "rotate-180"
            )}
          />
        </button>

        {/* Dropdown Menu */}
        {isOpen && !loading && (
          <div className="absolute z-50 mt-2 w-full min-w-[160px] rounded-md border border-gray-600 bg-gray-800 shadow-lg">
            <div className="max-h-60 overflow-auto py-1">
              {/* Clear option */}
              {hasSelection && (
                <>
                  <button
                    type="button"
                    className="flex w-full items-center px-3 py-2 text-sm text-gray-300 hover:bg-gray-700"
                    onClick={handleClear}
                  >
                    <span className="text-gray-400 italic">Clear selection</span>
                  </button>
                  <div className="border-t border-gray-600 my-1" />
                </>
              )}

              {/* Options */}
              {options.length > 0 ? (
                options.map((option) => (
                  <button
                    key={option}
                    type="button"
                    className={cn(
                      "flex w-full items-center px-3 py-2 text-sm transition-colors",
                      "text-gray-200 hover:bg-gray-700",
                      option === value && "bg-gray-700 text-blue-400"
                    )}
                    onClick={() => handleSelect(option)}
                  >
                    <span className="flex-1 text-left truncate">{option}</span>
                    {option === value && (
                      <Check className="h-4 w-4 text-blue-400 ml-2" />
                    )}
                  </button>
                ))
              ) : (
                <div className="px-3 py-2 text-sm text-gray-400 italic">
                  No options available
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};