import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';

interface TimeRangePickerProps {
  value: '7d' | '30d' | '90d' | '1y';
  onChange: (timeRange: '7d' | '30d' | '90d' | '1y') => void;
  startDate?: string;
  endDate?: string;
  onDateRangeChange: (startDate: string, endDate: string) => void;
}

/**
 * TimeRangePicker Component
 * 
 * Matches the time range picker from your screenshot.
 * Provides quick time range selection (7d, 30d, 90d, 1y) and custom date range.
 */
export const TimeRangePicker: React.FC<TimeRangePickerProps> = ({
  value,
  onChange,
  startDate,
  endDate,
  onDateRangeChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const timeRangeOptions = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 90 days' },
    { value: '1y', label: 'Last year' },
  ] as const;

  /**
   * Close dropdown when clicking outside
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowCustomDatePicker(false);
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
   * Get display text for current selection
   */
  const getDisplayText = (): string => {
    if (startDate && endDate) {
      try {
        const start = format(parseISO(startDate), 'MMM dd, yyyy');
        const end = format(parseISO(endDate), 'MMM dd, yyyy');
        return `${start} - ${end}`;
      } catch (error) {
        console.warn('Invalid date format:', { startDate, endDate });
      }
    }

    const selectedOption = timeRangeOptions.find(option => option.value === value);
    return selectedOption?.label || 'Select time range';
  };

  /**
   * Handle time range selection
   */
  const handleTimeRangeSelect = (selectedValue: '7d' | '30d' | '90d' | '1y') => {
    onChange(selectedValue);
    setIsOpen(false);
    setShowCustomDatePicker(false);
  };

  /**
   * Handle custom date range
   */
  const handleCustomDateSubmit = () => {
    if (customStartDate && customEndDate) {
      // Convert to ISO strings if they're just dates
      const startISO = customStartDate.includes('T') 
        ? customStartDate 
        : `${customStartDate}T00:00:00.000Z`;
      const endISO = customEndDate.includes('T') 
        ? customEndDate 
        : `${customEndDate}T23:59:59.999Z`;

      onDateRangeChange(startISO, endISO);
      setIsOpen(false);
      setShowCustomDatePicker(false);
    }
  };

  /**
   * Show custom date picker
   */
  const handleShowCustomPicker = () => {
    setShowCustomDatePicker(true);
    
    // Pre-populate with current dates if available
    if (startDate) {
      try {
        setCustomStartDate(format(parseISO(startDate), 'yyyy-MM-dd'));
      } catch (error) {
        setCustomStartDate('');
      }
    }
    
    if (endDate) {
      try {
        setCustomEndDate(format(parseISO(endDate), 'yyyy-MM-dd'));
      } catch (error) {
        setCustomEndDate('');
      }
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        className={cn(
          "flex h-10 items-center justify-between rounded-md border bg-gray-800 px-3 py-2 text-sm transition-colors",
          "border-gray-600 text-gray-100 hover:bg-gray-700 min-w-[200px]",
          "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900",
          isOpen && "ring-2 ring-blue-500"
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-400" />
          <span className="truncate">{getDisplayText()}</span>
        </div>
        <ChevronDown 
          className={cn(
            "h-4 w-4 transition-transform text-gray-400 ml-2",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 mt-2 w-full min-w-[250px] rounded-md border border-gray-600 bg-gray-800 shadow-lg">
          <div className="py-1">
            {!showCustomDatePicker ? (
              <>
                {/* Quick time range options */}
                {timeRangeOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={cn(
                      "flex w-full items-center px-3 py-2 text-sm transition-colors",
                      "text-gray-200 hover:bg-gray-700",
                      option.value === value && !startDate && !endDate && "bg-gray-700 text-blue-400"
                    )}
                    onClick={() => handleTimeRangeSelect(option.value)}
                  >
                    {option.label}
                  </button>
                ))}
                
                <div className="border-t border-gray-600 my-1" />
                
                {/* Custom date range option */}
                <button
                  type="button"
                  className={cn(
                    "flex w-full items-center px-3 py-2 text-sm transition-colors",
                    "text-gray-200 hover:bg-gray-700",
                    (startDate && endDate) && "bg-gray-700 text-blue-400"
                  )}
                  onClick={handleShowCustomPicker}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Custom date range
                </button>
              </>
            ) : (
              /* Custom date picker */
              <div className="p-3 space-y-3">
                <div className="text-sm font-medium text-gray-200 mb-2">
                  Select custom date range
                </div>
                
                <div className="space-y-2">
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">From</label>
                    <input
                      type="date"
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                      className="w-full h-8 px-2 text-sm bg-gray-700 border border-gray-600 rounded text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">To</label>
                    <input
                      type="date"
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                      className="w-full h-8 px-2 text-sm bg-gray-700 border border-gray-600 rounded text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={handleCustomDateSubmit}
                    disabled={!customStartDate || !customEndDate}
                    className="flex-1 h-8 px-3 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Apply
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCustomDatePicker(false)}
                    className="flex-1 h-8 px-3 text-sm bg-gray-700 text-gray-200 rounded hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};