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
 * Renders the "Daily Change Failures" red bar chart matching your screenshot.
 * Shows the number of failed deployments per day.
 */
export const ChangeFailureChart: React.FC<ChangeFailureChartProps> = ({
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
      failedDeployments: item.failed_deployments,
      totalDeployments: item.total_deployments,
      failureRate: item.failure_rate_percent,
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
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-gray-300">Failed deployments</span>
            <span className="text-red-400 font-bold ml-auto">{data.failedDeployments}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
            <span className="text-gray-300">Total deployments</span>
            <span className="text-gray-300 font-bold ml-auto">{data.totalDeployments}</span>
          </div>
          <div className="pt-1 border-t border-gray-600">
            <div className="text-xs text-gray-400">
              Failure rate: {(data.failureRate * 100).toFixed(1)}%
            </div>
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
        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
        <span className="text-gray-300 text-sm">Failed deployments</span>
      </div>
    </div>
  );

  return (
    <Card className="bg-gray-900 border-gray-800">
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
                    interval={0}
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
                    fill="#ef4444"
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