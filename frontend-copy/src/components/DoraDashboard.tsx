// frontend/src/components/DoraDashboard.tsx
// FIXED: All TypeScript errors resolved, using existing API methods

import React, { useState, useEffect, useCallback } from 'react';
import { Info } from 'lucide-react';
import { Button, Card, CardContent, LoadingSpinner, ErrorMessage } from '@/components/ui';
import { MetricCard } from '@/components/MetricCard';
import { DeploymentHeatmap } from '@/components/charts/DeploymentHeatmap'
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
  const [availableApplications, setAvailableApplications] = useState<string[]>([]);

  // Filter state - Fixed to properly handle timeRange type
  const [filters, setFilters] = useState<DashboardFilters>({
    timeRange: '30d' as '30d',  // Explicitly typed
    projectName: undefined,
    applicationName: undefined,
    environmentType: undefined,
  });

  // Loading states
  const [loading, setLoading] = useState<LoadingState & { cascadingFilters: boolean }>({
    deploymentFrequency: false,
    changeFailureRate: false,
    leadTime: false,
    meanTimeToRestore: false,
    filters: false,
    cascadingFilters: false,
  });

  // Error states
  const [errors, setErrors] = useState<ErrorState & { cascadingFilters: string | null }>({
    deploymentFrequency: null,
    changeFailureRate: null,
    leadTime: null,
    meanTimeToRestore: null,
    filters: null,
    cascadingFilters: null,
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
   * Load metrics data when filters change (debounced)
   */
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadMetricsData();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [filters]);

  /**
   * Load cascading applications when projects change
   */
  useEffect(() => {
    const projectArray = Array.isArray(filters.projectName) ? filters.projectName : 
                        filters.projectName ? [filters.projectName] : [];
    
    if (projectArray.length > 0) {
      loadCascadingApplications(projectArray);
    } else {
      setAvailableApplications(availableFilters?.available_filters.applications || []);
    }
  }, [filters.projectName, availableFilters]);

  /**
   * Load available filters from API
   * FIXED: Using the correct method name 'getFilters'
   */
  const loadAvailableFilters = async () => {
    setLoading(prev => ({ ...prev, filters: true }));
    setErrors(prev => ({ ...prev, filters: null }));

    try {
      const filtersData = await apiService.getFilters();
      setAvailableFilters(filtersData);
      setAvailableApplications(filtersData.available_filters.applications);
    } catch (error) {
      const errorMessage = errorUtils.getErrorMessage(error);
      console.error('Failed to load filters:', errorMessage);
      setErrors(prev => ({ ...prev, filters: errorMessage }));
    } finally {
      setLoading(prev => ({ ...prev, filters: false }));
    }
  };

  /**
   * Load cascading applications based on selected projects
   * FIXED: Using getCascadingFilters method (if it exists) or fallback to all applications
   */
  const loadCascadingApplications = async (selectedProjects: string[]) => {
    setLoading(prev => ({ ...prev, cascadingFilters: true }));
    setErrors(prev => ({ ...prev, cascadingFilters: null }));

    try {
      // Check if getCascadingFilters exists on apiService
      if ('getCascadingFilters' in apiService && typeof apiService.getCascadingFilters === 'function') {
        const cascadingFilters = await apiService.getCascadingFilters(selectedProjects);
        setAvailableApplications(cascadingFilters.applications);
      } else {
        // Fallback: use all applications
        console.warn('getCascadingFilters not available, using all applications');
        setAvailableApplications(availableFilters?.available_filters.applications || []);
      }
    } catch (error) {
      const errorMessage = errorUtils.getErrorMessage(error);
      console.error('Failed to load cascading applications:', errorMessage);
      setErrors(prev => ({ ...prev, cascadingFilters: errorMessage }));
      // Fallback to all applications
      setAvailableApplications(availableFilters?.available_filters.applications || []);
    } finally {
      setLoading(prev => ({ ...prev, cascadingFilters: false }));
    }
  };

  /**
   * Load all metrics data
   * FIXED: Build params correctly without non-existent getDateRangeParams
   */
  const loadMetricsData = async () => {
    console.log('Loading metrics with filters:', filters);

    // Build request params based on filters
    let requestParams: any = {};

    // Handle time range or custom dates
    if (filters.startDate && filters.endDate) {
      requestParams.startDate = filters.startDate;
      requestParams.endDate = filters.endDate;
    } else if (filters.timeRange) {
      // Use existing dateUtils.getTimeRangesDates
      const { startDate, endDate } = dateUtils.getTimeRangesDates(filters.timeRange);
      requestParams.startDate = startDate;
      requestParams.endDate = endDate;
    }

    // Add other filters
    if (filters.projectName) {
      requestParams.projectName = filters.projectName;
    }
    if (filters.applicationName) {
      requestParams.applicationName = filters.applicationName;
    }
    if (filters.environmentType) {
      requestParams.environmentType = filters.environmentType;
    }

    // Load all metrics in parallel
    await Promise.all([
      loadDeploymentFrequency(requestParams),
      loadChangeFailureRate(requestParams),
      loadLeadTime(requestParams),
      loadMeanTimeToRestore(requestParams),
    ]);

    setIsInitialLoad(false);
  };

  /**
   * Load deployment frequency data
   */
  const loadDeploymentFrequency = async (params: any) => {
    setLoading(prev => ({ ...prev, deploymentFrequency: true }));
    setErrors(prev => ({ ...prev, deploymentFrequency: null }));

    try {
      const data = await apiService.getDeploymentFrequency(params);
      
      // Debug log to verify data
      console.log('Deployment Frequency API Response:', {
        summary: data.summary,
        averagePerDay: data.summary.average_per_day,
        totalDeployments: data.summary.total_deployments
      });
      
      setMetricsData(prev => ({ ...prev, deploymentFrequency: data }));
    } catch (error) {
      const errorMessage = errorUtils.getErrorMessage(error);
      console.error('Failed to load deployment frequency:', errorMessage);
      setErrors(prev => ({ ...prev, deploymentFrequency: errorMessage }));
    } finally {
      setLoading(prev => ({ ...prev, deploymentFrequency: false }));
    }
  };

  /**
   * Load change failure rate data
   */
  const loadChangeFailureRate = async (params: any) => {
    setLoading(prev => ({ ...prev, changeFailureRate: true }));
    setErrors(prev => ({ ...prev, changeFailureRate: null }));

    try {
      const data = await apiService.getChangeFailureRate(params);
      setMetricsData(prev => ({ ...prev, changeFailureRate: data }));
    } catch (error) {
      const errorMessage = errorUtils.getErrorMessage(error);
      console.error('Failed to load change failure rate:', errorMessage);
      setErrors(prev => ({ ...prev, changeFailureRate: errorMessage }));
    } finally {
      setLoading(prev => ({ ...prev, changeFailureRate: false }));
    }
  };

  /**
   * Load lead time data
   */
  const loadLeadTime = async (params: any) => {
    setLoading(prev => ({ ...prev, leadTime: true }));
    setErrors(prev => ({ ...prev, leadTime: null }));

    try {
      const data = await apiService.getLeadTime(params);
      setMetricsData(prev => ({ ...prev, leadTime: data }));
    } catch (error) {
      const errorMessage = errorUtils.getErrorMessage(error);
      console.error('Failed to load lead time:', errorMessage);
      setErrors(prev => ({ ...prev, leadTime: errorMessage }));
    } finally {
      setLoading(prev => ({ ...prev, leadTime: false }));
    }
  };

  /**
   * Load mean time to restore data
   */
  const loadMeanTimeToRestore = async (params: any) => {
    setLoading(prev => ({ ...prev, meanTimeToRestore: true }));
    setErrors(prev => ({ ...prev, meanTimeToRestore: null }));

    try {
      const data = await apiService.getMeanTimeToRestore(params);
      setMetricsData(prev => ({ ...prev, meanTimeToRestore: data }));
    } catch (error) {
      const errorMessage = errorUtils.getErrorMessage(error);
      console.error('Failed to load mean time to restore:', errorMessage);
      setErrors(prev => ({ ...prev, meanTimeToRestore: errorMessage }));
    } finally {
      setLoading(prev => ({ ...prev, meanTimeToRestore: false }));
    }
  };

  /**
   * Handle time range change
   * FIXED: Properly typed
   */
  const handleTimeRangeChange = (value: string) => {
    console.log('Time range changed:', value);
    
    // Type guard to ensure value is valid
    const validTimeRanges = ['7d', '30d', '90d', '1y'] as const;
    const timeRange = validTimeRanges.includes(value as any) 
      ? (value as '7d' | '30d' | '90d' | '1y')
      : '30d' as const;
    
    setFilters(prev => ({
      ...prev,
      timeRange,
      startDate: undefined,
      endDate: undefined,
    }));
  };

  /**
   * Handle project filter change
   */
  const handleProjectChange = (value: string | string[] | undefined) => {
    console.log('Project filter changed:', value);
    
    setFilters(prev => ({
      ...prev,
      projectName: value,
      applicationName: undefined, // Reset application when projects change
    }));
  };

  /**
   * Handle application filter change
   */
  const handleApplicationChange = (value: string | string[] | undefined) => {
    console.log('Application filter changed:', value);
    
    setFilters(prev => ({
      ...prev,
      applicationName: value,
    }));
  };

  /**
   * Handle environment filter change
   */
  const handleEnvironmentChange = (value: string | string[] | undefined) => {
    console.log('Environment filter changed:', value);
    
    setFilters(prev => ({
      ...prev,
      environmentType: value,
    }));
  };

  /**
   * Handle date range change
   */
  const handleDateRangeChange = (startDate: string, endDate: string) => {
    console.log('Date range changed:', { startDate, endDate });
    
    setFilters(prev => ({
      ...prev,
      timeRange: undefined,
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
      timeRange: '30d' as const,
      projectName: undefined,
      applicationName: undefined,
      environmentType: undefined,
    });
  };

  // Check if any data is loading
  const isAnyLoading = Object.values(loading).some(Boolean);
  
  // Check if we have any filters applied
  const hasActiveFilters = (
    filters.projectName ||
    filters.applicationName ||
    filters.environmentType
  );

  // Get environment options
  const environmentOptions = ['Production', 'Non-Production'];

  return (
    <div className="min-h-screen bg-primary text-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-100 mb-2">DORA Metrics</h1>
            <p className="text-gray-400 text-sm">Track deployment frequency, change failure rate, lead time, and recovery time to understand engineering efficiency.</p>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowExplainer(true)}
            className="border-gray-700 hover:bg-gray-800"
          >
            <Info className="w-4 h-4 mr-2" />
            Show Explainer
          </Button>
        </div>

        <div className="my-10">
          <div className="my-12">
            <DeploymentHeatmap />
          </div>
        </div>

        {/* Filters */}
        <div className="px-1 py-2">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex flex-col">
              <span className="text-xs text-gray-400 mb-1 ml-1">Time range</span>
              <TimeRangePicker
                value={filters.timeRange || '1y'}
                startDate={filters.startDate}
                endDate={filters.endDate}
                onChange={handleTimeRangeChange}
                onDateRangeChange={handleDateRangeChange}
              />
            </div>

            {/* Project Filter */}
            <FilterDropdown
              label=""
              value={filters.projectName}
              options={availableFilters?.available_filters.projects || []}
              onChange={handleProjectChange}
              loading={loading.filters}
              placeholder="All projects"
              disabled={loading.filters}
              showSearch={true}
            />

            {/* Application Filter */}
            <FilterDropdown
              label=""
              value={filters.applicationName}
              options={availableApplications}
              onChange={handleApplicationChange}
              loading={loading.cascadingFilters}
              placeholder="All applications"
              disabled={loading.filters || loading.cascadingFilters}
              showSearch={true}
            />

            {/* Environment Filter */}
            <FilterDropdown
              label=""
              value={filters.environmentType}
              options={environmentOptions}
              onChange={handleEnvironmentChange}
              loading={loading.filters}
              placeholder="All environments"
              disabled={loading.filters}
              showSearch={false}
              maxSelections={2} 
            />

            {/* Clear Filters Button */}
            {hasActiveFilters && (
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
        </div>

        {/* Error Display */}
        {errors.filters && (
          <ErrorMessage
            message={`Failed to load filters: ${errors.filters}`}
            onRetry={loadAvailableFilters}
          />
        )}

        {/* Metric Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <MetricCard
            title="Deployment Frequency"
            value={metricsData.deploymentFrequency?.summary?.average_per_day}
            unit="Average deployments per day"
            color="#10b981"
            loading={loading.deploymentFrequency}
            error={errors.deploymentFrequency}
          />
          
          <MetricCard
            title="Change Failure Rate"
            value={metricsData.changeFailureRate?.summary?.overall_failure_rate}
            unit="The percentage of deployments causing a failure"
            color="#ef4444"
            loading={loading.changeFailureRate}
            error={errors.changeFailureRate}
            isPercentage
          />
          
          <MetricCard
            title="Median Lead Time to Change"
            value={metricsData.leadTime?.summary?.overall_median_hours}
            unit="Average hours from commit to production"
            color="#3b82f6"
            loading={loading.leadTime}
            error={errors.leadTime}
          />
          
          <MetricCard
            title="Time to Restore Services"
            value={metricsData.meanTimeToRestore?.summary?.overall_median_hours}
            unit="Average hours to restore services"
            color="#f59e0b"
            loading={loading.meanTimeToRestore}
            error={errors.meanTimeToRestore}
          />
        </div>

        {/* Charts Section */}
        <div className="space-y-6">

          <DeploymentChart
            data={metricsData.deploymentFrequency?.data || []}
            loading={loading.deploymentFrequency}
            error={errors.deploymentFrequency}
          />
          
          <ChangeFailureChart
            data={metricsData.changeFailureRate?.data || []}
            loading={loading.changeFailureRate}
            error={errors.changeFailureRate}
          />
          
          <LeadTimeChart
            data={metricsData.leadTime?.data || []}
            loading={loading.leadTime}
            error={errors.leadTime}
          />
          
          <TimeToRestoreChart
            data={metricsData.meanTimeToRestore?.data || []}
            loading={loading.meanTimeToRestore}
            error={errors.meanTimeToRestore}
          />
        </div>

        {/* Loading Overlay for Initial Load */}
        {isInitialLoad && isAnyLoading && (
          <div className="fixed inset-0 bg-gray-950 bg-opacity-50 flex items-center justify-center z-50">
            <Card className="bg-gray-900 border-gray-800 p-8">
              <CardContent className="flex flex-col items-center space-y-4">
                <LoadingSpinner className="h-8 w-8" />
                <p className="text-gray-400">Loading DORA metrics...</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Explainer Modal */}
        {showExplainer && (
          <ExplainerModal 
            open={showExplainer}
            onClose={() => setShowExplainer(false)} 
          />
        )}
      </div>
    </div>
  );
};