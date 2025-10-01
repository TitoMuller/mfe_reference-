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

  // Filter state 
  const [filters, setFilters] = useState<DashboardFilters>({
    timeRange: '1y' as '1y',  
    projectName: undefined,
    applicationName: undefined,
    environmentType: undefined,
  });

  // Staged filters: edits live here until the user clicks Apply
  const [stagedFilters, setStagedFilters] = useState<DashboardFilters>({
    timeRange: '1y' as '1y',
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
  // Placeholder state for teams and people filters (logic to be implemented later)
  const [selectedTeams, setSelectedTeams] = useState<string[] | undefined>(undefined);
  const [selectedPeople, setSelectedPeople] = useState<string[] | undefined>(undefined);

  /**
   * Load available filters on component mount
   */
  useEffect(() => {
    loadAvailableFilters();
  }, []);

  /**
   * Initial metrics load on mount. Subsequent loads occur only when Apply is pressed.
   */
  useEffect(() => {
    loadMetricsData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Update cascading applications in response to staged project selection changes.
   * This updates the available application list shown in the Application dropdown
   * but does NOT trigger a metrics reload until the user clicks Apply.
   */
  useEffect(() => {
    const projectArray = Array.isArray(stagedFilters.projectName) ? stagedFilters.projectName : 
                        stagedFilters.projectName ? [stagedFilters.projectName] : [];

    if (projectArray.length > 0) {
      loadCascadingApplications(projectArray);
    } else {
      // Restore the full application list when staged project selection is cleared
      setAvailableApplications(availableFilters?.available_filters.applications || []);
      // Also clear any staged application selection when projects are cleared
      setStagedFilters(prev => ({ ...prev, applicationName: undefined }));
    }
  }, [stagedFilters.projectName, availableFilters]);

  /**
   * Load available filters from API
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
   */
  const loadMetricsData = async (appliedFilters?: DashboardFilters) => {
    const useFilters = appliedFilters || filters;
    console.log('Loading metrics with filters:', useFilters);

    // Build request params based on filters
    let requestParams: any = {};

    // Handle time range or custom dates
    if (useFilters.startDate && useFilters.endDate) {
      requestParams.startDate = useFilters.startDate;
      requestParams.endDate = useFilters.endDate;
    } else if (useFilters.timeRange) {
      // Use existing dateUtils.getTimeRangesDates
      const { startDate, endDate } = dateUtils.getTimeRangesDates(useFilters.timeRange);
      requestParams.startDate = startDate;
      requestParams.endDate = endDate;
    }

    // Add other filters
    if (useFilters.projectName) {
      requestParams.projectName = useFilters.projectName;
    }
    if (useFilters.applicationName) {
      requestParams.applicationName = useFilters.applicationName;
    }
    if (useFilters.environmentType) {
      requestParams.environmentType = useFilters.environmentType;
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
   */
  const handleTimeRangeChange = (value: string) => {
    console.log('Time range changed:', value);
    
    // Type guard to ensure value is valid
    const validTimeRanges = ['7d', '30d', '90d', '1y'] as const;
    const timeRange = validTimeRanges.includes(value as any) 
      ? (value as '7d' | '30d' | '90d' | '1y')
      : '1y' as const;
    
    setStagedFilters(prev => ({
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
    setStagedFilters(prev => ({
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
    setStagedFilters(prev => ({
      ...prev,
      applicationName: value,
    }));
  };

  /**
   * Handle environment filter change
   */
  const handleEnvironmentChange = (value: string | string[] | undefined) => {
    console.log('Environment filter changed:', value);
    setStagedFilters(prev => ({
      ...prev,
      environmentType: value,
    }));
  };

  // Placeholder handlers for teams and people (no backend logic yet)
  const handleTeamsChange = (value: string[] | string[] | undefined) => {
    console.log('Teams filter changed (placeholder):', value);
    setSelectedTeams(value as any);
  };

  const handlePeopleChange = (value: string[] | string[] | undefined) => {
    console.log('People filter changed (placeholder):', value);
    setSelectedPeople(value as any);
  };

  // Apply button handler - will trigger a manual metrics reload
  const handleApplyFilters = async () => {
    console.log('Applying staged filters:', stagedFilters);
    // Run metrics load using staged filters, then update the applied filters
    await loadMetricsData(stagedFilters);
    setFilters(stagedFilters);
  };

  /**
   * Handle date range change
   */
  const handleDateRangeChange = (startDate: string, endDate: string) => {
    console.log('Date range changed:', { startDate, endDate });
    setStagedFilters(prev => ({
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
    // Reset staged filters only (do not apply until user hits Apply)
    setStagedFilters({
      timeRange: '30d' as const,
      projectName: undefined,
      applicationName: undefined,
      environmentType: undefined,
    });
    setSelectedTeams(undefined);
    setSelectedPeople(undefined);
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
          <div className="my-20">
            <DeploymentHeatmap />
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 8b-8">
          <div className="xl:col-span-1">
            <TimeRangePicker
              value={stagedFilters.timeRange || '1y'}
              startDate={stagedFilters.startDate}
              endDate={stagedFilters.endDate}
              onChange={handleTimeRangeChange}
              onDateRangeChange={handleDateRangeChange}
            />
          </div>

          <div className="xl:col-span-1">
            <FilterDropdown
              label=""
              value={stagedFilters.projectName}
              options={availableFilters?.available_filters.projects || []}
              onChange={handleProjectChange}
              loading={loading.filters}
              placeholder="All projects"
              disabled={loading.filters}
              showSearch={true}
            />
          </div>

          <div className="xl:col-span-1">
            <FilterDropdown
              label=""
              value={stagedFilters.applicationName}
              options={availableApplications}
              onChange={handleApplicationChange}
              loading={loading.cascadingFilters}
              placeholder="All applications"
              disabled={loading.filters || loading.cascadingFilters}
              showSearch={true}
            />
          </div>

          <div className="xl:col-span-1 flex items-end gap-4">
            <div className="flex-1">
              <FilterDropdown
                label=""
                value={stagedFilters.environmentType}
                options={environmentOptions}
                onChange={handleEnvironmentChange}
                loading={loading.filters}
                placeholder="All environments"
                disabled={loading.filters}
                showSearch={false}
                maxSelections={2} 
              />
            </div>
          </div>
        </div>

        {/* Secondary Filters Row: placeholder Team/People filters + Apply/Clear actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-6 mt-4">
          <div className="xl:col-span-1">
            <FilterDropdown
              label="Teams"
              value={selectedTeams}
              options={[]}
              onChange={handleTeamsChange}
              loading={false}
              placeholder="All teams"
              disabled={false}
              showSearch={false}
            />
          </div>

          <div className="xl:col-span-1">
            <FilterDropdown
              label="People"
              value={selectedPeople}
              options={[]}
              onChange={handlePeopleChange}
              loading={false}
              placeholder="All people"
              disabled={false}
              showSearch={false}
            />
          </div>

          <div className="xl:col-span-2 flex items-center justify-start gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleApplyFilters}
              className="border-gray-700 hover:bg-gray-800"
            >
              Apply
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              className="text-white hover:text-gray-200 hover:bg-gray-800"
            >
              Clear all
            </Button>
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
            color="#FAFAFA"
            loading={loading.deploymentFrequency}
            error={errors.deploymentFrequency}
          />

          <MetricCard
            title="Change Failure Rate"
            value={metricsData.changeFailureRate?.summary?.overall_failure_rate}
            unit="The percentage of deployments causing a failure"
            color="#FAFAFA"
            loading={loading.changeFailureRate}
            error={errors.changeFailureRate}
            isPercentage
          />
          
          <MetricCard
            title="Median Lead Time to Change"
            value={metricsData.leadTime?.summary?.overall_median_hours}
            unit="Average hours from commit to production"
            color="#FAFAFA"
            loading={loading.leadTime}
            error={errors.leadTime}
          />
          
          <MetricCard
            title="Time to Restore Services"
            value={metricsData.meanTimeToRestore?.summary?.overall_median_hours}
            unit="Average hours to restore services"
            color="#FAFAFA"
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