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
**/ 
export const TimeToRestoreChart: React.FC<TimeToRestoreChartProps> = ({
  data,
  loading,
  error,
  onRetry,
}) => {
  /**
   * Transform API data for Recharts
   * Updated to handle aggregated data structure from backend
   */
  const chartData = React.useMemo(() => {
    return data.map(item => ({
      date: item.date,
      formattedDate: dateUtils.formatChartDate(item.date),
      restoreTimeHours: item.median_hours_to_restore,
      // Enhanced context from backend aggregation
      incidentCount: item.incident_count || 0,
      projectCount: item.project_count || 0,
      applicationCount: item.application_count || 0,
      projects: item.projects || [],
      applications: item.applications || [],
      environments: item.environments || [],
    }));
  }, [data]);

  /**
   * Enhanced tooltip component showing aggregation context
   */
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || payload.length === 0) return null;

    const data = payload[0].payload;
    
    return (
      <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 shadow-lg max-w-xs">
        <div className="text-gray-200 font-medium mb-2">{label}</div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-rose-500 rounded-sm"></div>
            <span className="text-gray-300">Average time to restore</span>
            <span className="text-rose-500 font-bold ml-auto">
              {dateUtils.formatDuration ? dateUtils.formatDuration(data.restoreTimeHours) : `${data.restoreTimeHours.toFixed(1)}h`}
            </span>
          </div>
          <div className="text-xs text-gray-400">
            {data.restoreTimeHours.toFixed(1)} hours
          </div>
          {data.incidentCount > 0 && (
            <div className="text-xs text-gray-400">
              Based on {data.incidentCount} incident{data.incidentCount !== 1 ? 's' : ''}
            </div>
          )}
        </div>

        {/* Show aggregation context from backend */}
        {(data.projectCount > 0 || data.applicationCount > 0) && (
          <div className="text-xs text-gray-400 space-y-1 border-t border-gray-600 pt-2 mt-2">
            {data.projectCount > 0 && (
              <div>
                <span className="font-medium">
                  {data.projectCount} Project{data.projectCount !== 1 ? 's' : ''}
                </span>
                {data.projects.length > 0 && (
                  <div className="pl-2 max-h-16 overflow-y-auto">
                    {data.projects.slice(0, 3).map((project: string, idx: number) => (
                      <div key={idx} className="truncate text-gray-500">{project}</div>
                    ))}
                    {data.projects.length > 3 && (
                      <div className="text-gray-500">... and {data.projects.length - 3} more</div>
                    )}
                  </div>
                )}
              </div>
            )}
            
            {data.applicationCount > 0 && (
              <div>
                <span className="font-medium">
                  {data.applicationCount} Application{data.applicationCount !== 1 ? 's' : ''}
                </span>
                {data.applications.length > 0 && (
                  <div className="pl-2 max-h-16 overflow-y-auto">
                    {data.applications.slice(0, 3).map((app: string, idx: number) => (
                      <div key={idx} className="truncate text-gray-500">{app}</div>
                    ))}
                    {data.applications.length > 3 && (
                      <div className="text-gray-500">... and {data.applications.length - 3} more</div>
                    )}
                  </div>
                )}
              </div>
            )}

            {data.environments.length > 0 && (
              <div>
                <span className="font-medium">Environments:</span>
                <span className="pl-2 text-gray-500">{data.environments.join(', ')}</span>
              </div>
            )}
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
        <div className="w-3 h-3 bg-rose-500 rounded-sm"></div>
        <span className="text-gray-300 text-sm">Time to restore</span>
      </div>
    </div>
  );

  return (
    <Card className="bg-transparent border-none">
      <CardContent className="p-6">
        {/* Chart Header */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-200 mb-2">
            Time to Restore Services
          </h3>
          <p className="text-sm text-gray-400">
            Average time to restore services after incidents over time
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
                    // FIXED: Show fewer ticks for cleaner display
                    interval="preserveStartEnd"
                    tickCount={6}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                    tickFormatter={(value) => `${value.toFixed(0)}h`}
                  />
                  <Tooltip 
                    content={<CustomTooltip />}
                    cursor={{ stroke: '#F43F5E', strokeWidth: 1 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="restoreTimeHours"
                    stroke="#F43F5E"
                    strokeWidth={2}
                    fill="url(#purpleGradient)"
                    fillOpacity={0.6}
                  />
                  <defs>
                    <linearGradient id="purpleGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#F43F5E" stopOpacity={0.8} />
                      <stop offset="50%" stopColor="#F43F5E" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#F43F5E" stopOpacity={0.1} />
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