import React from 'react';
import { Card, CardContent, LoadingSpinner, ErrorMessage } from '@/components/ui';

interface MetricCardProps {
  title: string;
  value?: number;
  unit: string;
  color: string;
  loading: boolean;
  error: string | null;
  isPercentage?: boolean;
  isDuration?: boolean;
}

/**
 * MetricCard Component
 * 
 * Displays a single DORA metric with proper formatting and styling
 * Matches the design from your screenshot with:
 * - Large metric value
 * - Descriptive title
 * - Unit description
 * - Loading and error states
 */
export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  unit,
  color,
  loading,
  error,
  isPercentage = false,
  isDuration = false,
}) => {
  /**
   * Format the metric value based on type
   * FIXED: For percentages, the value is already a percentage, not a decimal
   */
  const formatValue = (val: number): string => {
    if (isPercentage) {
      // The API returns the percentage value directly (e.g., 0.03 for 0.03%)
      // so we don't need to multiply by 100
      return val.toFixed(2);
    }
    
    if (isDuration) {
      return val.toFixed(2);
    }
    
    // For deployment frequency, show one decimal place
    return val.toFixed(1);
  };

  /**
   * Get the display unit
   */
  const getDisplayUnit = (): string => {
    if (isPercentage) {
      return '%';
    }
    
    return '';
  };

  return (
    <Card className="bg-gray-900 border-gray-800 hover:bg-gray-850 transition-colors">
      <CardContent className="p-6">
        {/* Title */}
        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">
            {title}
          </h3>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner className="h-6 w-6" />
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="py-4">
            <div className="text-red-400 text-sm mb-2">Error loading data</div>
            <div className="text-4xl font-bold text-gray-600">--</div>
          </div>
        )}

        {/* Success State */}
        {!loading && !error && (
          <>
            {/* Main Metric Value */}
            <div className="flex items-baseline mb-3">
              <div 
                className="text-4xl font-bold"
                style={{ color }}
              >
                {value !== undefined ? formatValue(value) : '--'}
                <span className="text-2xl ml-1">
                  {getDisplayUnit()}
                </span>
              </div>
            </div>

            {/* Unit Description */}
            <p className="text-sm text-gray-400 leading-relaxed">
              {unit}
            </p>

            {/* Performance Indicator */}
            {value !== undefined && (
              <div className="mt-3 pt-3 border-t border-gray-800">
                <PerformanceIndicator
                  metricType={getMetricType(title)}
                  value={value}
                  isPercentage={isPercentage}
                />
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

/**
 * Get metric type from title for performance calculation
 */
const getMetricType = (title: string): string => {
  if (title.toLowerCase().includes('deployment')) return 'deployment_frequency';
  if (title.toLowerCase().includes('failure')) return 'change_failure_rate';
  if (title.toLowerCase().includes('lead')) return 'lead_time';
  if (title.toLowerCase().includes('restore')) return 'mean_time_to_restore';
  return 'unknown';
};

/**
 * Performance Indicator Component
 * Shows DORA performance benchmarks (Elite, High, Medium, Low)
 */
interface PerformanceIndicatorProps {
  metricType: string;
  value: number;
  isPercentage: boolean;
}

const PerformanceIndicator: React.FC<PerformanceIndicatorProps> = ({
  metricType,
  value,
  isPercentage,
}) => {
  /**
   * Determine performance level based on DORA benchmarks
   * FIXED: For change_failure_rate, the value is already a percentage
   */
  const getPerformanceLevel = (): {
    level: 'Elite' | 'High' | 'Medium' | 'Low';
    color: string;
    description: string;
  } => {
    switch (metricType) {
      case 'deployment_frequency':
        if (value > 1) {
          return {
            level: 'Elite',
            color: '#10b981',
            description: 'Multiple deployments per day',
          };
        }
        if (value > 0.14) { // Once per week
          return {
            level: 'High',
            color: '#f59e0b',
            description: 'Between once per week and once per month',
          };
        }
        return {
          level: 'Medium',
          color: '#ef4444',
          description: 'Less than once per month',
        };

      case 'change_failure_rate':
        // FIXED: The value is already a percentage (0.03 means 0.03%, not 3%)
        // So we don't need to divide by 100
        const rate = value; // Already in percentage form
        
        if (rate <= 15) { // 0-15%
          return {
            level: 'Elite',
            color: '#10b981',
            description: '0-15% failure rate',
          };
        }
        if (rate <= 30) { // 16-30%
          return {
            level: 'High',
            color: '#f59e0b',
            description: '16-30% failure rate',
          };
        }
        return {
          level: 'Medium',
          color: '#ef4444',
          description: '31%+ failure rate',
        };

      case 'lead_time':
        if (value < 24) {
          return {
            level: 'Elite',
            color: '#10b981',
            description: 'Less than one day',
          };
        }
        if (value < 168) { // One week
          return {
            level: 'High',
            color: '#f59e0b',
            description: 'Between one day and one week',
          };
        }
        return {
          level: 'Medium',
          color: '#ef4444',
          description: 'More than one week',
        };

      case 'mean_time_to_restore':
        if (value < 1) {
          return {
            level: 'Elite',
            color: '#10b981',
            description: 'Less than one hour',
          };
        }
        if (value < 24) {
          return {
            level: 'High',
            color: '#f59e0b',
            description: 'Less than one day',
          };
        }
        return {
          level: 'Medium',
          color: '#ef4444',
          description: 'More than one day',
        };

      default:
        return {
          level: 'Medium',
          color: '#6b7280',
          description: 'Performance data',
        };
    }
  };

  const performance = getPerformanceLevel();

  return (
    <div className="flex items-center gap-2">
      <div
        className="w-2 h-2 rounded-full"
        style={{ backgroundColor: performance.color }}
      />
      <div className="flex items-center gap-2 text-xs">
        <span
          className="font-medium"
          style={{ color: performance.color }}
        >
          {performance.level}
        </span>
        <span className="text-gray-500">•</span>
        <span className="text-gray-400">{performance.description}</span>
      </div>
    </div>
  );
};