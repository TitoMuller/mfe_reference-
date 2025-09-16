import React, { useState, useEffect, useCallback } from 'react';
import { Info } from 'lucide-react';
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
 * DoraDashboard Component (Fixed to support multi-select and cascading filters)
 * 
 * Fixed features:
 * 1. Multi-select filters with arrays instead of single values
 * 2. Cascading filter behavior (Project -> Applications)
 * 3. Environment filter with Production/Non-production options
 * 4. Visual improvements matching the screenshot design
 * 5. Proper handling of empty selections (environment logic)
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

  // State for available filters (now supporting cascading)
  const [availableFilters, setAvailableFilters] = useState<FiltersResponse | null>(null);
  const [availableApplications, setAvailableApplications] = useState<string[]>([]);

  // Fixed filter state to support arrays for multi-select
  const [filters, setFilters] = useState<DashboardFilters>({
    timeRange: '30d',
    projectName: undefined,      // Will be string[] when multi-select is used
    applicationName: undefined,  // Will be string[] when multi-select is used
    environmentType: undefined,  // Will be string[] when multi-select is used
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
    }, 300); // 300ms debounce

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
      // Reset applications to all available when no projects selected
      setAvailableApplications(availableFilters?.available_filters.applications || []);
      
      // Clear application selections if they're no longer valid
      if (filters.applicationName) {
        setFilters(prev => ({
          ...prev,
          applicationName: undefined,
        }));
      }
    }
  }, [filters.projectName, availableFilters]);

  /**
   * Load initial filter options from API
   */
  const loadAvailableFilters = async () => {
    setLoading(prev => ({ ...prev, filters: true }));
    setErrors(prev => ({ ...prev, filters: null }));

    try {
      const filtersData = await apiService.getFilters();
      setAvailableFilters(filtersData);
      setAvailableApplications(filtersData.available_filters.applications);
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
   * Load cascading applications based on selected projects
   */
  const loadCascadingApplications = useCallback(async (selectedProjects: string[]) => {
    setLoading(prev => ({ ...prev, cascadingFilters: true }));
    setErrors(prev => ({ ...prev, cascadingFilters: null }));

    try {
      // Call API with selected projects to get filtered applications
      const cascadingFilters = await apiService.getCascadingFilters(selectedProjects);
      setAvailableApplications(cascadingFilters.applications);

      // Remove any selected applications that are no longer available
      const currentAppArray = Array.isArray(filters.applicationName) ? filters.applicationName :
                             filters.applicationName ? [filters.applicationName] : [];
      const validApplications = currentAppArray.filter(app => 
        cascadingFilters.applications.includes(app)
      );
      
      if (validApplications.length !== currentAppArray.length) {
        setFilters(prev => ({
          ...prev,
          applicationName: validApplications.length > 0 ? validApplications : undefined,
        }));
      }

      console.log('Cascading applications loaded:', cascadingFilters.applications);
    } catch (error) {
      const errorMessage = errorUtils.getErrorMessage(error);
      setErrors(prev => ({ ...prev, cascadingFilters: errorMessage }));
      console.error('Failed to load cascading applications:', error);
    } finally {
      setLoading(prev => ({ ...prev, cascadingFilters: false }));
    }
  }, [filters.applicationName]);

  /**
   * Load all metrics data from API with current filters
   */
  const loadMetricsData = async () => {
    console.log('Loading metrics data with filters:', filters);

    // Set loading state for all metrics
    setLoading(prev => ({
      ...prev,
      deploymentFrequency: true,
      changeFailureRate: true,
      leadTime: true,
      meanTimeToRestore: true,
    }));

    // Clear previous errors
    setErrors(prev => ({
      ...prev,
      deploymentFrequency: null,
      changeFailureRate: null,
      leadTime: null,
      meanTimeToRestore: null,
    }));

    try {
      // Build API parameters handling both single values and arrays
      const apiParams = {
        ...filters,
        // Handle environment filter logic: empty = both Production and Non-production
        environmentType: getEffectiveEnvironmentFilter(filters.environmentType),
        // Add date range if time range is selected
        ...(filters.timeRange && dateUtils.getTimeRangesDates(filters.timeRange)),
      };

      console.log('API parameters:', apiParams);

      // Fetch all metrics
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
      setErrors(prev => ({
        ...prev,
        deploymentFrequency: errorMessage,
        changeFailureRate: errorMessage,
        leadTime: errorMessage,
        meanTimeToRestore: errorMessage,
      }));
    } finally {
      // Clear loading state
      setLoading(prev => ({
        ...prev,
        deploymentFrequency: false,
        changeFailureRate: false,
        leadTime: false,
        meanTimeToRestore: false,
      }));
    }
  };

  /**
   * Get effective environment filter for API calls
   * According to spec: empty selection behaves same as selecting both
   */
  const getEffectiveEnvironmentFilter = (environmentFilter: string | string[] | undefined): string[] => {
    if (!environmentFilter) {
      return ['Production', 'Non-production']; // Empty = both
    }
    
    const envArray = Array.isArray(environmentFilter) ? environmentFilter : [environmentFilter];
    
    if (envArray.length === 0) {
      return ['Production', 'Non-production']; // Empty = both
    }
    
    return envArray;
  };

  /**
   * Handle project filter changes with cascading logic
   */
  const handleProjectChange = (selectedProjects: string[] | undefined) => {
    console.log('Project filter changed:', selectedProjects);
    
    setFilters(prev => ({
      ...prev,
      projectName: selectedProjects,
      // Clear applications when projects change (they'll be reloaded)
      applicationName: undefined,
    }));
  };

  /**
   * Handle application filter changes
   */
  const handleApplicationChange = (selectedApplications: string[] | undefined) => {
    console.log('Application filter changed:', selectedApplications);
    
    setFilters(prev => ({
      ...prev,
      applicationName: selectedApplications,
    }));
  };

  /**
   * Handle environment filter changes
   * Environment filter has special values: Production, Non-production
   */
  const handleEnvironmentChange = (selectedEnvironments: string[] | undefined) => {
    console.log('Environment filter changed:', selectedEnvironments);
    
    setFilters(prev => ({
      ...prev,
      environmentType: selectedEnvironments,
    }));
  };

  /**
   * Handle time range changes
   */
  const handleTimeRangeChange = (timeRange: string) => {
    console.log('Time range changed:', timeRange);
    
    setFilters(prev => ({
      ...prev,
      timeRange: timeRange as any,
      startDate: undefined,
      endDate: undefined,
    }));
  };

  /**
   * Handle custom date range changes
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

  /**
   * Retry loading filters
   */
  const handleRetryFilters = () => {
    console.log('Retrying filter load');
    loadAvailableFilters();
  };

  // Check if any data is loading
  const isAnyLoading = Object.values(loading).some(Boolean);
  
  // Check if we have any data to display
  const hasData = Object.values(metricsData).some(data => data !== null);

  // Check if we have any filters applied
  const hasActiveFilters = (
    filters.projectName ||
    filters.applicationName ||
    filters.environmentType
  );

  // Get environment options (fixed values as per requirement)
  const environmentOptions = ['Production', 'Non-production'];

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

        {/* Fixed Filters Row - now with multi-select and cascading */}
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-4">
              {/* Time Range Picker */}
              <div className="flex flex-col">
                <label className="text-sm text-gray-400 mb-1">Time range</label>
                <TimeRangePicker
                  value={filters.timeRange || '30d'}
                  onChange={handleTimeRangeChange}
                  startDate={filters.startDate}
                  endDate={filters.endDate}
                  onDateRangeChange={handleDateRangeChange}
                />
              </div>

              {/* Multi-Select Project Filter */}
              <FilterDropdown
                label="All projects"
                value={filters.projectName}
                options={availableFilters?.available_filters.projects || []}
                onChange={handleProjectChange}
                loading={loading.filters}
                placeholder="All projects"
                disabled={loading.filters}
                showSearch={true}
              />

              {/* Multi-Select Application Filter (cascading) */}
              <FilterDropdown
                label="All applications"
                value={filters.applicationName}
                options={availableApplications}
                onChange={handleApplicationChange}
                loading={loading.cascadingFilters}
                placeholder="All applications"
                disabled={loading.filters || loading.cascadingFilters}
                showSearch={true}
              />

              {/* Environment Filter (Production/Non-production only) */}
              <FilterDropdown
                label="Environment"
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
          </CardContent>
        </Card>

        {/* Error Display */}
        {errors.filters && (
          <ErrorMessage
            message={`Failed to load filters: ${errors.filters}`}
            onRetry={handleRetryFilters}
          />
        )}

        {errors.cascadingFilters && (
          <ErrorMessage
            message={`Failed to load cascading filters: ${errors.cascadingFilters}`}
            onRetry={() => {
              const projectArray = Array.isArray(filters.projectName) ? filters.projectName : 
                                  filters.projectName ? [filters.projectName] : [];
              if (projectArray.length > 0) {
                loadCascadingApplications(projectArray);
              }
            }}
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
          />
          
          <MetricCard
            title="Time to Restore Services"
            value={metricsData.meanTimeToRestore?.summary.overall_median_hours}
            unit="Average hours to restore services"
            color="#f59e0b"
            loading={loading.meanTimeToRestore}
            error={errors.meanTimeToRestore}
          />
        </div>

        {/* Charts Section - 4 charts stacked vertically */}
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