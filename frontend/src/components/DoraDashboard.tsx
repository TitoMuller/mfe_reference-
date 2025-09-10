import React, { useState, useEffect } from 'react';
import { Calendar, ChevronDown, Info } from 'lucide-react';
import { Button, Card, CardContent, LoadingSpinner, ErrorMessage } from '@/components/ui';
import { MetricCard } from '@/components/MetricCard';
import { DeploymentChart } from '@/components/charts/DeploymentChart';
import { ChangeFailureChart } from '@/components/charts/ChangeFailureChart';
import { LeadTimeChart } from '@/components/charts/LeadTimeChart';
import { TimeToRestoreChart } from '@/components/charts/TimeToRestoreChart';
import { FilterDropdown } from '@/components/FilterDropdown';
import { TimeRangePicker } from '@/components/TimeRangePicker';
import { ExplainerModal } from '@/components/ExplainerModal';
import { apiService } from '@/services/apiService';
import { 
  DashboardFilters, 
  LoadingState, 
  ErrorState,
  DeploymentFrequencyResponse,
  ChangeFailureRateResponse,
  LeadTimeResponse,
  MeanTimeToRestoreResponse,
  FiltersResponse
} from '@/types/api';
import { dateUtils, errorUtils } from '@/lib/utils';

/**
 * Main DORA Metrics Dashboard Component
 * 
 * This component renders the complete dashboard matching your screenshot:
 * - Header with title and explainer button
 * - Filter row with time range and dropdowns
 * - 4 metric cards showing key numbers
 * - 4 charts stacked vertically
 */
export const DoraDashboard: React.FC = () => {
  // State for dashboard data
  const [metricsData, setMetricsData] = useState<{
    deploymentFrequency: DeploymentFrequencyResponse | null;
    changeFailureRate: ChangeFailureRateResponse | null;
    leadTime: LeadTimeResponse | null;
    meanTimeToRestore: MeanTimeToRestoreResponse | null;
  }>({
    deploymentFrequency: null,
    changeFailureRate: null,
    leadTime: null,
    meanTimeToRestore: null,
  });

  // State for available filters
  const [availableFilters, setAvailableFilters] = useState<FiltersResponse | null>(null);

  // State for current filters
  const [filters, setFilters] = useState<DashboardFilters>({
    timeRange: '30d', // Default to 30 days as shown in screenshot
    projectName: undefined,
    applicationName: undefined,
    environmentType: undefined,
  });

  // Loading states
  const [loading, setLoading] = useState<LoadingState>({
    deploymentFrequency: false,
    changeFailureRate: false,
    leadTime: false,
    meanTimeToRestore: false,
    filters: false,
  });

  // Error states
  const [errors, setErrors] = useState<ErrorState>({
    deploymentFrequency: null,
    changeFailureRate: null,
    leadTime: null,
    meanTimeToRestore: null,
    filters: null,
  });

  // UI state
  const [showExplainer, setShowExplainer] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  /**
   * Load available filters on component mount
   */
  useEffect(() => {
    loadAvailableFilters();
  }, []);

  /**
   * Load metrics data when filters change
   */
  useEffect(() => {
    loadMetricsData();
  }, [filters]);

  /**
   * Load available filter options from API
   */
  const loadAvailableFilters = async () => {
    setLoading(prev => ({ ...prev, filters: true }));
    setErrors(prev => ({ ...prev, filters: null }));

    try {
      const filtersData = await apiService.getFilters();
      setAvailableFilters(filtersData);
      console.log('Available filters loaded:', filtersData);
    } catch (error) {
      const errorMessage = errorUtils.getErrorMessage(error);
      setErrors(prev => ({ ...prev, filters: errorMessage }));
      console.error('Failed to load filters:', error);
    } finally {
      setLoading(prev => ({ ...prev, filters: false }));
    }
  };

  /**
   * Load all metrics data from API
   */
  const loadMetricsData = async () => {
    console.log('Loading metrics data with filters:', filters);

    // Set loading state for all metrics
    setLoading({
      deploymentFrequency: true,
      changeFailureRate: true,
      leadTime: true,
      meanTimeToRestore: true,
      filters: loading.filters,
    });

    // Clear previous errors
    setErrors({
      deploymentFrequency: null,
      changeFailureRate: null,
      leadTime: null,
      meanTimeToRestore: null,
      filters: errors.filters,
    });

    // Build API parameters
    const apiParams = {
      ...filters,
      ...(filters.timeRange && dateUtils.getTimeRangesDates(filters.timeRange)),
    };

    try {
      // Fetch all metrics in parallel for better performance
      const allMetrics = await apiService.getAllMetrics(apiParams);
      
      setMetricsData(allMetrics);
      console.log('All metrics loaded successfully');

      if (isInitialLoad) {
        setIsInitialLoad(false);
      }
    } catch (error) {
      console.error('Failed to load metrics:', error);
      const errorMessage = errorUtils.getErrorMessage(error);

      // Set error for all metrics
      setErrors({
        deploymentFrequency: errorMessage,
        changeFailureRate: errorMessage,
        leadTime: errorMessage,
        meanTimeToRestore: errorMessage,
        filters: errors.filters,
      });
    } finally {
      // Clear loading state
      setLoading({
        deploymentFrequency: false,
        changeFailureRate: false,
        leadTime: false,
        meanTimeToRestore: false,
        filters: loading.filters,
      });
    }
  };

  /**
   * Handle filter changes
   */
  const handleFilterChange = (key: keyof DashboardFilters, value: any) => {
    console.log('Filter changed:', { key, value });
    
    setFilters(prev => ({
      ...prev,
      [key]: value,
      // Reset date range when time range is changed
      ...(key === 'timeRange' && { startDate: undefined, endDate: undefined }),
    }));
  };

  /**
   * Handle time range changes from date picker
   */
  const handleDateRangeChange = (startDate: string, endDate: string) => {
    console.log('Date range changed:', { startDate, endDate });
    
    setFilters(prev => ({
      ...prev,
      timeRange: '30d', // Reset to default
      startDate,
      endDate,
    }));
  };

  /**
   * Clear all filters
   */
  const handleClearFilters = () => {
    console.log('Clearing all filters');
    
    setFilters({
      timeRange: '30d',
      projectName: undefined,
      applicationName: undefined,
      environmentType: undefined,
    });
  };

  /**
   * Retry loading data
   */
  const handleRetry = () => {
    console.log('Retrying data load');
    loadMetricsData();
  };

  // Check if any data is loading
  const isAnyLoading = Object.values(loading).some(Boolean);
  
  // Check if we have any data to display
  const hasData = Object.values(metricsData).some(data => data !== null);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header - matches screenshot design */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-100 mb-2">DORA Metrics</h1>
            <p className="text-gray-400 text-sm">Explainer subtitle.</p>
          </div>
          
          <Button
            variant="outline"
            onClick={() => setShowExplainer(true)}
            className="bg-gray-800 border-gray-600 text-gray-200 hover:bg-gray-700"
          >
            <Info className="h-4 w-4 mr-2" />
            Show Explainer
          </Button>
        </div>

        {/* Filters Row - matches screenshot layout */}
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-4">
              {/* Time Range Picker */}
              <div className="flex flex-col">
                <label className="text-sm text-gray-400 mb-1">Time range</label>
                <TimeRangePicker
                  value={filters.timeRange}
                  onChange={(timeRange) => handleFilterChange('timeRange', timeRange)}
                  startDate={filters.startDate}
                  endDate={filters.endDate}
                  onDateRangeChange={handleDateRangeChange}
                />
              </div>

              {/* Project Filter */}
              <FilterDropdown
                label="All projects"
                value={filters.projectName}
                options={availableFilters?.available_filters.projects || []}
                onChange={(value) => handleFilterChange('projectName', value)}
                loading={loading.filters}
                placeholder="All projects"
              />

              {/* Application Filter */}
              <FilterDropdown
                label="All applications"
                value={filters.applicationName}
                options={availableFilters?.available_filters.applications || []}
                onChange={(value) => handleFilterChange('applicationName', value)}
                loading={loading.filters}
                placeholder="All applications"
              />

              {/* Environment Filter - appears twice in screenshot */}
              <FilterDropdown
                label="All projects"
                value={filters.environmentType}
                options={availableFilters?.available_filters.environments || []}
                onChange={(value) => handleFilterChange('environmentType', value)}
                loading={loading.filters}
                placeholder="All projects"
              />

              {/* Clear Filters */}
              {(filters.projectName || filters.applicationName || filters.environmentType) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearFilters}
                  className="text-gray-400 hover:text-gray-200"
                >
                  Clear all
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Error Display */}
        {errors.filters && (
          <ErrorMessage
            message={`Failed to load filters: ${errors.filters}`}
            onRetry={loadAvailableFilters}
          />
        )}

        {/* Metric Cards Row - 4 cards horizontally */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <MetricCard
            title="Deployment Frequency"
            value={metricsData.deploymentFrequency?.summary.average_per_day}
            unit="Average deployments per day"
            color="#10b981"
            loading={loading.deploymentFrequency}
            error={errors.deploymentFrequency}
          />
          
          <MetricCard
            title="Change Failure Rate"
            value={metricsData.changeFailureRate?.summary.overall_failure_rate}
            unit="Failure rate (%)"
            color="#ef4444"
            loading={loading.changeFailureRate}
            error={errors.changeFailureRate}
            isPercentage
          />
          
          <MetricCard
            title="Median Lead Time to Change"
            value={metricsData.leadTime?.summary.overall_median_hours}
            unit="Average hours from commit to production"
            color="#3b82f6"
            loading={loading.leadTime}
            error={errors.leadTime}
            isDuration
          />
          
          <MetricCard
            title="Time to Restore Services"
            value={metricsData.meanTimeToRestore?.summary.overall_median_hours}
            unit="Average hours to restore services in the given period"
            color="#8b5cf6"
            loading={loading.meanTimeToRestore}
            error={errors.meanTimeToRestore}
            isDuration
          />
        </div>

        {/* Charts Section - 4 charts stacked vertically */}
        <div className="space-y-6">
          <DeploymentChart
            data={metricsData.deploymentFrequency?.data || []}
            loading={loading.deploymentFrequency}
            error={errors.deploymentFrequency}
            onRetry={handleRetry}
          />
          
          <ChangeFailureChart
            data={metricsData.changeFailureRate?.data || []}
            loading={loading.changeFailureRate}
            error={errors.changeFailureRate}
            onRetry={handleRetry}
          />
          
          <LeadTimeChart
            data={metricsData.leadTime?.data || []}
            loading={loading.leadTime}
            error={errors.leadTime}
            onRetry={handleRetry}
          />
          
          <TimeToRestoreChart
            data={metricsData.meanTimeToRestore?.data || []}
            loading={loading.meanTimeToRestore}
            error={errors.meanTimeToRestore}
            onRetry={handleRetry}
          />
        </div>

        {/* Initial Loading State */}
        {isInitialLoad && isAnyLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <LoadingSpinner className="h-8 w-8 mx-auto mb-4" />
              <p className="text-gray-400">Loading DORA metrics...</p>
            </div>
          </div>
        )}
      </div>

      {/* Explainer Modal */}
      <ExplainerModal
        open={showExplainer}
        onClose={() => setShowExplainer(false)}
      />
    </div>
  );
};