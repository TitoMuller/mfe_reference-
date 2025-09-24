// frontend/src/components/charts/DeploymentHeatmap.tsx

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { apiService } from '@/services/apiService';

// Type definitions
interface DeploymentData {
  date: string;
  successful_count: number;
  failed_count: number;
}

export interface DeploymentHeatmapProps {
  organizationName?: string;
}

interface TooltipState {
  visible: boolean;
  x: number;
  y: number;
  date: Date | null;
  successful: number;
  failed: number;
}

// Date utility functions
const formatDate = (date: Date, format: string): string => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  if (format === 'yyyy-MM-dd') {
    // Use UTC methods to avoid timezone shifts
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } else if (format === 'MMM') {
    return months[date.getUTCMonth()];
  } else if (format === 'EEE') {
    return days[date.getUTCDay()];
  } else if (format === 'full') {
    const dayName = days[date.getUTCDay()];
    const monthName = months[date.getUTCMonth()];
    const day = date.getUTCDate();
    const year = date.getUTCFullYear();
    return `${dayName}, ${monthName} ${day}, ${year}`;
  }
  return date.toISOString();
};

const subMonths = (date: Date, months: number): Date => {
  const result = new Date(date);
  result.setMonth(result.getMonth() - months);
  return result;
};

const startOfDay = (date: Date): Date => {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
};

const getStartOfWeek = (date: Date): Date => {
  const result = new Date(date);
  const day = result.getDay();
  const diff = day === 0 ? -6 : 1 - day; // Adjust to start on Monday
  result.setDate(result.getDate() + diff);
  result.setHours(0, 0, 0, 0);
  return result;
};

const isSameDay = (date1: Date, date2: Date): boolean => {
  return date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate();
};

// Color scales for the heatmap
const getIntensityLevel = (count: number): number => {
  if (count === 0) return 0;
  if (count <= 2) return 1;
  if (count <= 5) return 2;
  if (count <= 10) return 3;
  return 4;
};

// Color definitions matching the screenshot - BLUE for successful
const COLORS = {
  successful: {
    0: '#161b22', // Empty (dark gray background)
    1: '#0c2d6b',
    2: '#0969da', 
    3: '#54aeff',
    4: '#79c0ff'
  },
  failed: {
    0: '#161b22', // Empty (dark gray background)
    1: '#4e1519',
    2: '#7d1f28',
    3: '#b32636',
    4: '#da3633'
  },
  blended: {
    // When both successful and failed deployments exist
    low: '#4a3625',  // Low activity blend
    medium: '#6b4c3a', // Medium activity blend  
    high: '#8d6e50'  // High activity blend
  },
  empty: '#161b22'
};

export const DeploymentHeatmap: React.FC<DeploymentHeatmapProps> = ({ organizationName }) => {
  const [showSuccessful, setShowSuccessful] = useState(true);
  const [showFailed, setShowFailed] = useState(true);
  const [tooltip, setTooltip] = useState<TooltipState>({
    visible: false,
    x: 0,
    y: 0,
    date: null,
    successful: 0,
    failed: 0
  });
  const [data, setData] = useState<DeploymentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch deployment data for last 12 months
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const endDate = new Date();
        const startDate = subMonths(startOfDay(endDate), 12);
        
        // Use the apiService instead of fetch
        const [deploymentResponse, failureResponse] = await Promise.all([
          apiService.getDeploymentFrequency({
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString()
          }),
          apiService.getChangeFailureRate({
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString()
          })
        ]);

        // Combine the data
        const combinedMap = new Map<string, DeploymentData>();
        
        // Process successful deployments
        deploymentResponse.data?.forEach((item: any) => {
          // Parse the date ensuring UTC interpretation
          const itemDate = new Date(item.date + (item.date.includes('T') ? '' : 'T00:00:00.000Z'));
          const dateKey = formatDate(itemDate, 'yyyy-MM-dd');
          combinedMap.set(dateKey, {
            date: dateKey,
            successful_count: item.deployment_count || 0,
            failed_count: 0
          });
        });

        // Add failed deployment data
        failureResponse.data?.forEach((item: any) => {
          // Parse the date ensuring UTC interpretation
          const itemDate = new Date(item.date + (item.date.includes('T') ? '' : 'T00:00:00.000Z'));
          const dateKey = formatDate(itemDate, 'yyyy-MM-dd');
          const existing = combinedMap.get(dateKey);
          if (existing) {
            existing.failed_count = item.failed_deployments || 0;
            // Adjust successful count to exclude failures
            existing.successful_count = Math.max(0, (item.total_deployments || 0) - (item.failed_deployments || 0));
          } else {
            combinedMap.set(dateKey, {
              date: dateKey,
              successful_count: Math.max(0, (item.total_deployments || 0) - (item.failed_deployments || 0)),
              failed_count: item.failed_deployments || 0
            });
          }
        });

        setData(Array.from(combinedMap.values()));
      } catch (error) {
        console.error('Error fetching deployment data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [organizationName]);

  // Generate calendar grid data
  const calendarData = useMemo(() => {
    const endDate = new Date();
    const startDate = subMonths(startOfDay(endDate), 12);
    
    // Create a map for quick lookup
    const dataMap = new Map(
      data.map(d => [d.date, d])
    );
    
    // Generate weeks for the grid
    const weeks: Date[][] = [];
    
    // Start from the beginning of the week containing the start date
    const calendarStart = getStartOfWeek(startDate);
    
    let currentDate = new Date(calendarStart);
    let currentWeek: Date[] = [];
    
    // Generate roughly 53 weeks (1 year)
    for (let i = 0; i < 371; i++) {
      currentWeek.push(new Date(currentDate));
      
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    if (currentWeek.length > 0) {
      // Pad the last week if necessary
      while (currentWeek.length < 7) {
        const nextDate = new Date(currentDate);
        currentWeek.push(nextDate);
        currentDate.setDate(currentDate.getDate() + 1);
      }
      weeks.push(currentWeek);
    }
    
    return { weeks, dataMap, startDate, endDate };
  }, [data]);

  // Get color for a cell - FIXED: No date adjustment needed here
  const getCellColor = (date: Date): string => {
    const dateKey = formatDate(date, 'yyyy-MM-dd');
    const dayData = calendarData.dataMap.get(dateKey);
    
    if (!dayData) return COLORS.empty;
    
    const hasSuccessful = dayData.successful_count > 0;
    const hasFailed = dayData.failed_count > 0;
    
    if (!showSuccessful && !showFailed) return COLORS.empty;
    
    // Blended color when both exist and both are shown
    if (hasSuccessful && hasFailed && showSuccessful && showFailed) {
      const totalCount = dayData.successful_count + dayData.failed_count;
      if (totalCount > 10) return COLORS.blended.high;
      if (totalCount > 5) return COLORS.blended.medium;
      return COLORS.blended.low;
    }
    
    // Single color based on what's visible
    if (showSuccessful && hasSuccessful && !showFailed) {
      const level = getIntensityLevel(dayData.successful_count);
      return COLORS.successful[level as keyof typeof COLORS.successful];
    }
    
    if (showFailed && hasFailed && !showSuccessful) {
      const level = getIntensityLevel(dayData.failed_count);
      return COLORS.failed[level as keyof typeof COLORS.failed];
    }
    
    if (showSuccessful && hasSuccessful) {
      const level = getIntensityLevel(dayData.successful_count);
      return COLORS.successful[level as keyof typeof COLORS.successful];
    }
    
    if (showFailed && hasFailed) {
      const level = getIntensityLevel(dayData.failed_count);
      return COLORS.failed[level as keyof typeof COLORS.failed];
    }
    
    return COLORS.empty;
  };

  // Handle cell hover - FIXED: Proper tooltip positioning
  const handleCellHover = (date: Date, event: React.MouseEvent<HTMLDivElement>) => {
    const dateKey = formatDate(date, 'yyyy-MM-dd');
    const dayData = calendarData.dataMap.get(dateKey);
    
    // Don't show tooltip for dates outside our range
    if (date < calendarData.startDate || date > calendarData.endDate) {
      setTooltip({ ...tooltip, visible: false });
      setHoveredDate(null);
      return;
    }
    
    const rect = event.currentTarget.getBoundingClientRect();
    const containerRect = containerRef.current?.getBoundingClientRect();
    
    setTooltip({
      visible: true,
      x: rect.left - (containerRect?.left || 0) + rect.width / 2,
      y: rect.top - (containerRect?.top || 0) - 10,
      date: date,
      successful: dayData?.successful_count || 0,
      failed: dayData?.failed_count || 0
    });
    setHoveredDate(date);
  };

  // Month labels
  const monthLabels = useMemo(() => {
    const labels: { month: string; colStart: number }[] = [];
    let lastMonth = '';
    let colStart = 0;
    
    calendarData.weeks[0]?.forEach((_, weekIndex) => {
      // Check the date in the middle of the month (row 2)
      if (calendarData.weeks[2]) {
        const date = calendarData.weeks[2][weekIndex];
        if (date && date >= calendarData.startDate) {
          const month = formatDate(date, 'MMM');
          if (month !== lastMonth) {
            labels.push({ month, colStart: weekIndex });
            lastMonth = month;
          }
        }
      }
    });
    
    return labels;
  }, [calendarData]);

  if (loading) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-800 rounded w-48 mb-4"></div>
          <div className="h-32 bg-gray-800 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-6" ref={containerRef}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-200">
          Deployments Heatmap (last 12 months)
        </h3>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-400">Less</span>
          <div className="flex items-center gap-1">
            {[0, 1, 2, 3, 4].map(level => (
              <div
                key={level}
                className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: COLORS.successful[level as keyof typeof COLORS.successful] }}
              />
            ))}
          </div>
          <span className="text-sm text-gray-400">More</span>
          
          {/* Legend toggles */}
          <div className="flex items-center gap-3 ml-6">
            <button
              onClick={() => setShowSuccessful(!showSuccessful)}
              className={`flex items-center gap-2 px-2 py-1 rounded transition-opacity ${
                !showSuccessful ? 'opacity-50' : ''
              }`}
            >
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-sm text-gray-300">Successful</span>
            </button>
            <button
              onClick={() => setShowFailed(!showFailed)}
              className={`flex items-center gap-2 px-2 py-1 rounded transition-opacity ${
                !showFailed ? 'opacity-50' : ''
              }`}
            >
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span className="text-sm text-gray-300">Failed</span>
            </button>
          </div>
        </div>
      </div>
      
      <div className="text-xs text-gray-500 mb-2">
        Click a metric in the legend to show or hide it on the heatmap.
      </div>

      {/* Calendar Grid */}
      <div className="relative">
        {/* Month labels */}
        <div className="flex mb-1 ml-8">
          {monthLabels.map((label, idx) => (
            <div
              key={idx}
              className="text-xs text-gray-400"
              style={{ marginLeft: idx === 0 ? `${label.colStart * 15}px` : '45px' }}
            >
              {label.month}
            </div>
          ))}
        </div>

        {/* Weekday labels */}
        <div className="flex gap-[3px]">
          <div className="w-8 flex flex-col gap-[3px] mr-2">
            <div className="h-3" />
            <div className="h-3 text-xs text-gray-500 flex items-center">Mon</div>
            <div className="h-3" />
            <div className="h-3 text-xs text-gray-500 flex items-center">Wed</div>
            <div className="h-3" />
            <div className="h-3 text-xs text-gray-500 flex items-center">Fri</div>
            <div className="h-3" />
          </div>

          {/* Grid - FIXED: Columns are weeks, rows are days */}
          <div className="flex gap-[3px]">
            {calendarData.weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-[3px]">
                {week.map((day, dayIndex) => {
                  const isOutsideRange = day < calendarData.startDate || day > calendarData.endDate;
                  const isHovered = hoveredDate && isSameDay(day, hoveredDate);
                  
                  return (
                    <div
                      key={dayIndex}
                      className={`w-3 h-3 rounded-sm cursor-pointer transition-all ${
                        isHovered ? 'ring-1 ring-gray-400' : ''
                      }`}
                      style={{
                        backgroundColor: isOutsideRange ? 'transparent' : getCellColor(day),
                        opacity: isOutsideRange ? 0 : 1
                      }}
                      onMouseEnter={(e) => handleCellHover(day, e)}
                      onMouseLeave={() => {
                        setTooltip({ ...tooltip, visible: false });
                        setHoveredDate(null);
                      }}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Tooltip - FIXED: Always appears above cursor */}
        {tooltip.visible && tooltip.date && (
          <div
            className="absolute z-10 bg-gray-800 border border-gray-600 rounded-lg p-2 shadow-xl pointer-events-none"
            style={{
              left: `${tooltip.x}px`,
              bottom: `${containerRef.current ? containerRef.current.offsetHeight - tooltip.y + 10 : 'auto'}px`,
              transform: 'translateX(-50%)'
            }}
          >
            <div className="text-xs font-medium text-gray-200 mb-1">
              {formatDate(tooltip.date, 'full')}
            </div>
            {(tooltip.successful > 0 || tooltip.failed > 0) ? (
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-300">
                    {tooltip.successful + tooltip.failed} deployment{tooltip.successful + tooltip.failed !== 1 ? 's' : ''}
                  </span>
                </div>
                {showSuccessful && tooltip.successful > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    <span className="text-xs text-gray-400">
                      {tooltip.successful} successful
                    </span>
                  </div>
                )}
                {showFailed && tooltip.failed > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    <span className="text-xs text-gray-400">
                      {tooltip.failed} failed
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-xs text-gray-400">
                No deployments
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};