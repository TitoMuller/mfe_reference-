import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, LoadingSpinner, ErrorMessage } from '@/components/ui';
import { DeploymentFrequencyData } from '@/types/api';
import { dateUtils } from '@/lib/utils';

interface DeploymentChartProps {
  data: DeploymentFrequencyData[];
  loading: boolean;
  error: string | null;
  onRetry?: () => void;
}

/**
 * DeploymentChart Component
 * 
 * Renders the "Daily Deployments" green bar chart matching your screenshot.
 * Features:
 * - Green bars for deployment counts
 * - Hover tooltips showing exact values
 * - Responsive design
 * - Loading and error states
 */
export const DeploymentChart: React.FC<DeploymentChartProps> = ({
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
      deployments: item.deployment_count,
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
        <div className="text-gray-200 font-medium mb-1">{label}</div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="text-gray-300">Deployments</span>
          <span className="text-green-400 font-bold ml-auto">{data.deployments}</span>
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
        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
        <span className="text-gray-300 text-sm">Deployments</span>
      </div>
    </div>
  );

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardContent className="p-6">
        {/* Chart Header */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-200 mb-2">
            Daily Deployments
          </h3>
          <p className="text-sm text-gray-400">
            Number of deployments per day across all selected projects and applications
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <LoadingSpinner className="h-8 w-8 mx-auto mb-4" />
              <p className="text-gray-400">Loading deployment data...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="py-8">
            <ErrorMessage
              message={`Failed to load deployment data: ${error}`}
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
                    cursor={{ fill: 'rgba(16, 185, 129, 0.1)' }}
                  />
                  <Bar
                    dataKey="deployments"
                    fill="#10b981"
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
              <div className="text-gray-400 mb-2">No deployment data available</div>
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