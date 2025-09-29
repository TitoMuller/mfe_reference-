import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Search } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui';
import { cn } from '@/lib/utils';

interface FilterDropdownProps {
  label: string;
  value?: string | string[];
  options: string[];
  onChange: (value: string[] | undefined) => void;
  loading?: boolean;
  placeholder?: string;
  disabled?: boolean;
  showSearch?: boolean;
  maxSelections?: number;
}

/**
 * FilterDropdown Component (Fixed to support multi-select)
 * 
 * Now properly supports multi-select with checkboxes as shown in the screenshot:
 * - Multi-select with checkboxes
 * - Visual pills display for selected items
 * - Search functionality for large lists
 * - "Select All" and "Clear All" options
 * - Maintains existing function signature for compatibility
 */
export const FilterDropdown: React.FC<FilterDropdownProps> = ({
  label,
  value,
  options,
  onChange,
  loading = false,
  placeholder = "All projects",
  disabled = false,
  showSearch = true,
  maxSelections,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Normalize value to always be an array for internal logic
  const selectedValues = Array.isArray(value) ? value : (value ? [value] : []);

  /**
   * Close dropdown when clicking outside
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
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
   * Focus search input when dropdown opens
   */
  useEffect(() => {
    if (isOpen && showSearch && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, showSearch]);

  /**
   * Handle keyboard navigation
   */
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      setIsOpen(false);
      setSearchTerm('');
    }
  };

  /**
   * Handle option selection/deselection
   */
  const handleToggleOption = (option: string) => {
    const isSelected = selectedValues.includes(option);
    let newValue: string[];

    if (isSelected) {
      // Deselect
      newValue = selectedValues.filter(item => item !== option);
    } else {
      // Select (if not at max limit)
      if (maxSelections && selectedValues.length >= maxSelections) {
        return; // Don't add if at limit
      }
      newValue = [...selectedValues, option];
    }

    // Call onChange with array or undefined if empty
    onChange(newValue.length > 0 ? newValue : undefined);
  };

  /**
   * Select all options
   */
  const handleSelectAll = () => {
    const filteredOptions = getFilteredOptions();
    const limitedOptions = maxSelections 
      ? filteredOptions.slice(0, maxSelections)
      : filteredOptions;
    onChange(limitedOptions);
  };

  /**
   * Clear all selections
   */
  const handleClearAll = () => {
    onChange(undefined);
  };

  /**
   * Get filtered options based on search term
   */
  const getFilteredOptions = () => {
    if (!options || !Array.isArray(options)) return [];
    if (!searchTerm) return options;
    return options.filter(option => 
      option.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  /**
   * Generate display text for the trigger button
   */
  const getDisplayText = () => {
    if (loading) return 'Loading...';
    if (selectedValues.length === 0) return placeholder;
    if (selectedValues.length === 1) return selectedValues[0];
    if (options && selectedValues.length === options.length) return 'All selected';
    return `${selectedValues.length} selected`;
  };

  /**
   * Get display pills for selected items (matching screenshot format)
   */
  const getDisplayPills = () => {
    if (selectedValues.length === 0) return null;

    const pillClass = 'inline-flex items-center px-2 py-0.5 rounded text-xs bg-black text-white overflow-hidden';

    if (selectedValues.length <= 2) {
      return selectedValues.map(item => (
        <span
          key={item}
          className={`${pillClass} max-w-[140px] mr-1`}
          title={item}
        >
          <span className="truncate">{item}</span>
        </span>
      ));
    }

    return [
      <span key={selectedValues[0]} className={`${pillClass} max-w-[110px] mr-1`} title={selectedValues[0]}>
        <span className="truncate">{selectedValues[0]}</span>
      </span>,
      selectedValues.length > 1 && (
        <span key={selectedValues[1]} className={`${pillClass} max-w-[110px] mr-1`} title={selectedValues[1]}>
          <span className="truncate">{selectedValues[1]}</span>
        </span>
      ),
      selectedValues.length > 2 && (
        <span key="more" className={`${pillClass} px-2 py-0.5 rounded text-xs bg-black text-white`}>
          +{selectedValues.length - 2}
        </span>
      ),
    ].filter(Boolean);
  };

  const filteredOptions = getFilteredOptions();
  const hasSelection = selectedValues.length > 0;
  const isAllSelected = options && Array.isArray(options) && selectedValues.length === options.length && options.length > 0;

  return (
    <div className="flex flex-col">
      
      <div className="relative" ref={dropdownRef}>
        {/* Trigger Button */}
        <button
          type="button"
          className={cn(
            "flex h-10 w-full min-w-[180px] items-center justify-between rounded-md border bg-gray-900 px-3 py-2 text-sm transition-colors",
            "border-gray-600 text-gray-100 hover:bg-gray-900",
            "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900",
            disabled && "opacity-50 cursor-not-allowed",
            isOpen && "ring-2 ring-blue-500"
          )}
          onClick={() => !disabled && !loading && setIsOpen(!isOpen)}
          onKeyDown={handleKeyDown}
          disabled={disabled || loading}
        >
          <div className="flex items-center gap-1 flex-1 min-w-0">
            {loading ? (
              <div className="flex items-center gap-2">
                <LoadingSpinner className="h-4 w-4" />
                Loading...
              </div>
            ) : hasSelection ? (
              <div className="flex items-center gap-1 overflow-hidden whitespace-nowrap min-w-0">
                {getDisplayPills()}
              </div>
            ) : (
              <span className="text-white truncate">
                {placeholder}
              </span>
            )}
          </div>
          
          <ChevronDown 
            className={cn(
              "h-4 w-4 transition-transform text-white flex-shrink-0 ml-2",
              isOpen && "rotate-180"
            )}
          />
        </button>

        {/* Dropdown Menu */}
        {isOpen && !loading && (
          <div className="absolute z-50 mt-2 w-full min-w-[240px] rounded-md border border-gray-600 bg-gray-800 shadow-lg">
            {/* Search Input */}
            {showSearch && options && options.length > 5 && (
              <div className="p-3 border-b border-gray-600">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder={`Search ${label.toLowerCase()}`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            <div className="max-h-60 overflow-auto py-1">
              {/* Select All / Clear All Actions */}
              <div className="px-3 py-2 border-b border-gray-600">
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    className="text-xs text-neutral-700 hover:text-neutral-700"
                    onClick={handleSelectAll}
                    disabled={isAllSelected}
                  >
                    Select All
                  </button>
                  {hasSelection && (
                    <button
                      type="button"
                      className="text-xs text-white hover:text-gray-300"
                      onClick={handleClearAll}
                    >
                      Clear All
                    </button>
                  )}
                </div>
              </div>

              {/* Options */}
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => {
                  const isSelected = selectedValues.includes(option);
                  const isDisabledDueToLimit = !isSelected && maxSelections ? selectedValues.length >= maxSelections : false;
                  
                  return (
                    <button
                      key={option}
                      type="button"
                      className={cn(
                        "flex w-full items-center px-3 py-2 text-sm transition-colors",
                        "text-gray-200 hover:bg-gray-700",
                        isSelected && "bg-gray-700",
                        isDisabledDueToLimit && "opacity-50 cursor-not-allowed"
                      )}
                      onClick={() => !isDisabledDueToLimit && handleToggleOption(option)}
                      disabled={isDisabledDueToLimit}
                    >
                      {/* Checkbox */}
                      <div className={cn(
                        "w-4 h-4 mr-3 rounded border-2 flex items-center justify-center",
                        isSelected 
                          ? "bg-violet-600 border-violet-600" 
                          : "border-gray-400 bg-transparent"
                      )}>
                        {isSelected && (
                          <Check className="h-3 w-3 text-white" />
                        )}
                      </div>
                      
                      {/* Option Label */}
                      <span className="flex-1 text-left truncate">{option}</span>
                    </button>
                  );
                })
              ) : (
                <div className="px-3 py-2 text-sm text-gray-400 italic">
                  {searchTerm ? 'No matching options' : 'No options available'}
                </div>
              )}
            </div>

            {/* Footer with selection count */}
            {hasSelection && (
              <div className="px-3 py-2 border-t border-gray-600 text-xs text-gray-400">
                {selectedValues.length} of {options?.length || 0} selected
                {maxSelections && ` (max: ${maxSelections})`}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};