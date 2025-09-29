import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, LoadingSpinner, ErrorMessage } from '@/components/ui';
import { ChangeFailureRateData } from '@/types/api';
import { dateUtils } from '@/lib/utils';

interface ChangeFailureChartProps {
  data: ChangeFailureRateData[];
  loading: boolean;
  error: string | null;
  onRetry?: () => void;
}

/**
 * ChangeFailureChart Component
 * 
 * PRODUCTION VERSION: Uses backend SQL aggregation
 * - Data comes pre-aggregated by date from the microservice
 * - Simple clean X-axis with preserveStartEnd and tickCount
 * - Enhanced tooltips show aggregation context
 * - Much better performance for large datasets
 */
export const ChangeFailureChart: React.FC<ChangeFailureChartProps> = ({
  data,
  loading,
  error,
  onRetry,
}) => {
  /**
   * SIMPLIFIED: Transform API data for Recharts
   * Since backend now returns pre-aggregated data by date, we just need to format it
   */
  const chartData = React.useMemo(() => {
    return data.map(item => ({
      date: item.date,
      formattedDate: dateUtils.formatChartDate(item.date),
      failedDeployments: item.failed_deployments,
      totalDeployments: item.total_deployments,
      failureRate: item.failure_rate_percent,
      // Enhanced context from backend aggregation
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
            <span className="text-gray-300">Failed deployments</span>
            <span className="text-rose-500 font-bold ml-auto">{data.failedDeployments}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-500 rounded-sm"></div>
            <span className="text-gray-300">Total deployments</span>
            <span className="text-gray-300 font-bold ml-auto">{data.totalDeployments}</span>
          </div>
          <div className="pt-1 border-t border-gray-600">
            <div className="text-xs text-gray-400">
              Failure rate: {(data.failureRate * 100).toFixed(1)}%
            </div>
          </div>
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
                  <div className="pl-2 max-h-20 overflow-y-auto">
                    {data.projects.slice(0, 3).map((project: string, idx: number) => (
                      <div key={idx} className="truncate">{project}</div>
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
                  <div className="pl-2 max-h-20 overflow-y-auto">
                    {data.applications.slice(0, 3).map((app: string, idx: number) => (
                      <div key={idx} className="truncate">{app}</div>
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
                <span className="pl-2">{data.environments.join(', ')}</span>
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
        <span className="text-gray-300 text-sm">Failed deployments</span>
      </div>
    </div>
  );

  return (
    <Card className="bg-transparent border-none">
      <CardContent className="p-6">
        {/* Chart Header */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-200 mb-2">
            Daily Change Failures
          </h3>
          <p className="text-sm text-gray-400">
            Number of failed deployments per day across all selected projects and applications
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <LoadingSpinner className="h-8 w-8 mx-auto mb-4" />
              <p className="text-gray-400">Loading change failure data...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="py-8">
            <ErrorMessage
              message={`Failed to load change failure data: ${error}`}
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
                <BarChart
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
                    tickFormatter={(value) => value.toString()}
                  />
                  <Tooltip 
                    content={<CustomTooltip />}
                    cursor={{ fill: 'rgba(239, 68, 68, 0.1)' }}
                  />
                  <Bar
                    dataKey="failedDeployments"
                    fill="#F43F5E"
                    radius={[2, 2, 0, 0]}
                    maxBarSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}

        {/* Empty State */}
        {!loading && !error && chartData.length === 0 && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="text-gray-400 mb-2">No change failure data available</div>
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