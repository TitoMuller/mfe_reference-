import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, LoadingSpinner, ErrorMessage } from '@/components/ui';
import { MeanTimeToRestoreData } from '@/types/api';
import { dateUtils } from '@/lib/utils';

interface TimeToRestoreChartProps {
  data: MeanTimeToRestoreData[];
  loading: boolean;
  error: string | null;
  onRetry?: () => void;
}

/**
 * TimeToRestoreChart Component
 * 
 * Renders the "Time to Restore Services" purple/red area chart matching your screenshot.
 * Shows mean time to restore services over time.
 */
export const TimeToRestoreChart: React.FC<TimeToRestoreChartProps> = ({
  data,
  loading,
  error,
  onRetry,
}) => {
  /**
   * Transform API data for Recharts
   */
  const chartData = React.useMemo(() => {
    return data.map(item => ({
      date: item.date,
      formattedDate: dateUtils.formatChartDate(item.date),
      restoreTimeHours: item.median_hours_to_restore,
      // Additional data for tooltip
      projectName: item.project_name,
      applicationName: item.application_name,
      environmentType: item.environment_type,
    }));
  }, [data]);

  /**
   * Custom tooltip component
   */
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || payload.length === 0) return null;

    const data = payload[0].payload;
    
    return (
      <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 shadow-lg">
        <div className="text-gray-200 font-medium mb-2">{label}</div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
            <span className="text-gray-300">Time to restore</span>
            <span className="text-purple-400 font-bold ml-auto">
              {dateUtils.formatDuration(data.restoreTimeHours)}
            </span>
          </div>
          <div className="text-xs text-gray-400">
            {data.restoreTimeHours.toFixed(1)} hours
          </div>
        </div>
        {data.projectName && (
          <div className="text-xs text-gray-400 mt-1">
            Project: {data.projectName}
          </div>
        )}
      </div>
    );
  };

  /**
   * Custom legend component
   */
  const CustomLegend = () => (
    <div className="flex items-center justify-end gap-4 mb-4">
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
        <span className="text-gray-300 text-sm">Time to restore</span>
      </div>
    </div>
  );

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardContent className="p-6">
        {/* Chart Header */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-200 mb-2">
            Time to Restore Services
          </h3>
          <p className="text-sm text-gray-400">
            Median time to restore services after incidents over time
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <LoadingSpinner className="h-8 w-8 mx-auto mb-4" />
              <p className="text-gray-400">Loading time to restore data...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="py-8">
            <ErrorMessage
              message={`Failed to load time to restore data: ${error}`}
              onRetry={onRetry}
            />
          </div>
        )}

        {/* Chart */}
        {!loading && !error && (
          <>
            <CustomLegend />
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartData}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 60,
                  }}
                >
                  <CartesianGrid 
                    strokeDasharray="3 3" 
                    stroke="#374151"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="formattedDate"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                    interval={0}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                    tickFormatter={(value) => `${value.toFixed(0)}h`}
                  />
                  <Tooltip 
                    content={<CustomTooltip />}
                  />
                  <Area
                    type="monotone"
                    dataKey="restoreTimeHours"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    fill="url(#purpleGradient)"
                    fillOpacity={0.6}
                  />
                  <defs>
                    <linearGradient id="purpleGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.8} />
                      <stop offset="50%" stopColor="#ec4899" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#ef4444" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </>
        )}

        {/* Empty State */}
        {!loading && !error && chartData.length === 0 && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="text-gray-400 mb-2">No time to restore data available</div>
              <p className="text-sm text-gray-500">
                Try adjusting your filters or time range
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};