import { databricksService } from './databricks-service';
import { logWithContext } from '@/utils/logger';
import {
  DeploymentFrequencyResponse,
  ChangeFailureRateResponse,
  LeadTimeResponse,
  MeanTimeToRestoreResponse,
  DoraMetricsResponse,
  DeploymentFrequencyQueryParams,
  ChangeFailureRateQueryParams,
  LeadTimeQueryParams,
  MeanTimeToRestoreQueryParams,
  BaseQueryParams,
} from '@/models/dora-models';

/**
 * DORA Metrics Business Logic Service
 * Handles data transformation, calculations, and business rules
 */
export class DoraService {

  /**
   * Get deployment frequency metrics with business logic
   */
  async getDeploymentFrequency(params: DeploymentFrequencyQueryParams): Promise<DeploymentFrequencyResponse> {
    const { organizationName, aggregation = 'daily', ...queryParams } = params;

    logWithContext.info('Processing deployment frequency request', organizationName, { params });

    // Fetch raw data from database
    const rawData = await databricksService.getDeploymentFrequency({
      organizationName,
      ...(queryParams as unknown as Record<string, any>),
      aggregation,
    });

    // Transform and aggregate data based on requested aggregation
    const aggregatedData = this.aggregateDeploymentData(rawData, aggregation);

  // Calculate summary statistics
  const totalDeployments = rawData.reduce((sum, row) => sum + row.deployment_count, 0);
  // Use provided start/end first, otherwise infer from data dates
  const dataDates = rawData.map(r => r.deployment_date).filter(Boolean);
  const startDate = (queryParams as any).startDate ? new Date((queryParams as any).startDate) : (dataDates.length ? new Date(dataDates.sort()[dataDates.length - 1]) : new Date());
  const endDate = (queryParams as any).endDate ? new Date((queryParams as any).endDate) : (dataDates.length ? new Date(dataDates.sort()[0]) : new Date());
  const msPerDay = 24 * 60 * 60 * 1000;
  const days = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / msPerDay));
  const averagePerDay = totalDeployments > 0 ? totalDeployments / days : 0;

    // Determine date range from data or params
    const dateRange = this.calculateDateRange(rawData.map(r => r.deployment_date), queryParams.startDate, queryParams.endDate);

    const response: DeploymentFrequencyResponse = {
      metric: 'deployment_frequency',
      data: aggregatedData.map(row => ({
        date: row.deployment_date,
        organization_name: row.organization_name,
        project_name: row.project_name,
        application_name: row.application_name,
        environment_type: row.environment_type,
        deployment_count: row.deployment_count,
        daily_average: aggregation === 'daily' ? row.deployment_count : undefined,
      })),
      summary: {
        organization_name: organizationName,
        total_deployments: totalDeployments,
        average_per_day: Math.round(averagePerDay * 100) / 100,
        date_range: dateRange,
        filters_applied: this.extractFilters(queryParams),
      },
    };

    logWithContext.info('Successfully processed deployment frequency request', organizationName, {
      recordCount: response.data.length,
      totalDeployments,
      averagePerDay: response.summary.average_per_day,
    });

    return response;
  }

  /**
   * Get change failure rate metrics with business logic
   */
  async getChangeFailureRate(params: ChangeFailureRateQueryParams): Promise<ChangeFailureRateResponse> {
    const { organizationName, ...queryParams } = params;

    logWithContext.info('Processing change failure rate request', organizationName, { params });

    // Fetch raw data from database
    const rawData = await databricksService.getChangeFailureRate({
      organizationName,
      ...(queryParams as unknown as Record<string, any>),
    });

    // Calculate overall metrics
    const totalDeployments = rawData.reduce((sum, row) => sum + row.total_deployments, 0);
    const totalFailedDeployments = rawData.reduce((sum, row) => sum + row.failed_deployments, 0);
    const overallFailureRate = totalDeployments > 0 ? (totalFailedDeployments / totalDeployments) * 100 : 0;

    // Determine date range
    const dateRange = this.calculateDateRange(rawData.map(r => r.deployment_date), queryParams.startDate, queryParams.endDate);

    const response: ChangeFailureRateResponse = {
      metric: 'change_failure_rate',
      data: rawData.map(row => ({
        date: row.deployment_date,
        organization_name: row.organization_name,
        project_name: row.project_name,
        application_name: row.application_name,
        environment_type: row.environment_type,
        total_deployments: row.total_deployments,
        failed_deployments: row.failed_deployments,
        failure_rate_percent: Math.round(row.change_failure_rate_percent * 100) / 100,
      })),
      summary: {
        overall_failure_rate: Math.round(overallFailureRate * 100) / 100,
        total_deployments: totalDeployments,
        total_failed_deployments: totalFailedDeployments,
        date_range: dateRange,
        filters_applied: this.extractFilters(queryParams),
      },
    };

    logWithContext.info('Successfully processed change failure rate request', organizationName, {
      recordCount: response.data.length,
      overallFailureRate: response.summary.overall_failure_rate,
    });

    return response;
  }

  /**
   * Get lead time for changes metrics with business logic
   */
  async getLeadTimeForChanges(params: LeadTimeQueryParams): Promise<LeadTimeResponse> {
    const { organizationName, ...queryParams } = params;

    logWithContext.info('Processing lead time for changes request', organizationName, { params });

    // Fetch raw data from database
    const rawData = await databricksService.getLeadTimeForChanges({
      organizationName,
      ...(queryParams as unknown as Record<string, any>),
    });

    // Calculate overall median lead time
    const leadTimes = rawData.map(row => row.median_lead_time_hours).filter(time => time > 0);
    const overallMedianHours = this.calculateMedian(leadTimes);

    // Determine date range
    const dateRange = this.calculateDateRange(rawData.map(r => r.deployment_date), queryParams.startDate, queryParams.endDate);

    const response: LeadTimeResponse = {
      metric: 'lead_time_for_changes',
      data: rawData.map(row => ({
        date: row.deployment_date,
        organization_name: row.organization_name,
        project_name: row.project_name,
        application_name: row.application_name,
        environment_type: row.environment_type,
        median_lead_time_hours: Math.round(row.median_lead_time_hours * 100) / 100,
        lead_time_days: Math.round((row.median_lead_time_hours / 24) * 100) / 100,
      })),
      summary: {
        overall_median_hours: Math.round(overallMedianHours * 100) / 100,
        overall_median_days: Math.round((overallMedianHours / 24) * 100) / 100,
        date_range: dateRange,
        filters_applied: this.extractFilters(queryParams),
      },
    };

    logWithContext.info('Successfully processed lead time for changes request', organizationName, {
      recordCount: response.data.length,
      overallMedianHours: response.summary.overall_median_hours,
    });

    return response;
  }

  /**
   * Get mean time to restore metrics with business logic
   */
  async getMeanTimeToRestore(params: MeanTimeToRestoreQueryParams): Promise<MeanTimeToRestoreResponse> {
    const { organizationName, ...queryParams } = params;

    logWithContext.info('Processing mean time to restore request', organizationName, { params });

    // Fetch raw data from database
    const rawData = await databricksService.getMeanTimeToRestore({
      organizationName,
      ...(queryParams as unknown as Record<string, any>),
    });

    // Calculate overall median MTTR
    const mttrTimes = rawData.map(row => row.median_hours_to_restore).filter(time => time > 0);
    const overallMedianHours = this.calculateMedian(mttrTimes);

    // Determine date range
    const dateRange = this.calculateDateRange(rawData.map(r => r.deployment_date), queryParams.startDate, queryParams.endDate);

    const response: MeanTimeToRestoreResponse = {
      metric: 'mean_time_to_restore',
      data: rawData.map(row => ({
        date: row.deployment_date,
        organization_name: row.organization_name,
        project_name: row.project_name,
        application_name: row.application_name,
        environment_type: row.environment_type,
        median_hours_to_restore: Math.round(row.median_hours_to_restore * 100) / 100,
        restore_time_days: Math.round((row.median_hours_to_restore / 24) * 100) / 100,
      })),
      summary: {
        overall_median_hours: Math.round(overallMedianHours * 100) / 100,
        overall_median_days: Math.round((overallMedianHours / 24) * 100) / 100,
        date_range: dateRange,
        filters_applied: this.extractFilters(queryParams),
      },
    };

    logWithContext.info('Successfully processed mean time to restore request', organizationName, {
      recordCount: response.data.length,
      overallMedianHours: response.summary.overall_median_hours,
    });

    return response;
  }

  /**
   * Get all DORA metrics combined
   */
  async getAllDoraMetrics(params: BaseQueryParams): Promise<DoraMetricsResponse> {
    const { organizationName, ...queryParams } = params;

    logWithContext.info('Processing all DORA metrics request', organizationName, { params });

    // Fetch summary data efficiently
    const summary = await databricksService.getDoraMetricsSummary({
      organizationName,
      ...(queryParams as unknown as Record<string, any>),
    });

    // Determine date range (use provided dates or calculate from data)
    const dateRange = {
      start: queryParams.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      end: queryParams.endDate || new Date().toISOString(),
    };

    const response: DoraMetricsResponse = {
      organization_name: organizationName,
      date_range: dateRange,
      metrics: {
        deployment_frequency: {
          average_per_day: summary.deploymentFrequency.averagePerDay,
          total_deployments: summary.deploymentFrequency.totalDeployments,
        },
        change_failure_rate: {
          failure_rate_percent: summary.changeFailureRate.overallRate,
          total_deployments: summary.changeFailureRate.totalDeployments,
          failed_deployments: summary.changeFailureRate.failedDeployments,
        },
        lead_time_for_changes: {
          median_hours: summary.leadTime.medianHours,
          median_days: summary.leadTime.medianDays,
        },
        mean_time_to_restore: {
          median_hours: summary.meanTimeToRestore.medianHours,
          median_days: summary.meanTimeToRestore.medianDays,
        },
      },
      filters_applied: this.extractFilters(queryParams),
    };

    logWithContext.info('Successfully processed all DORA metrics request', organizationName, {
      deploymentFrequency: response.metrics.deployment_frequency.average_per_day,
      changeFailureRate: response.metrics.change_failure_rate.failure_rate_percent,
      leadTime: response.metrics.lead_time_for_changes.median_days,
      mttr: response.metrics.mean_time_to_restore.median_days,
    });

    return response;
  }

  /**
   * Get available filters for an organization
   */
  async getAvailableFilters(organizationName: string): Promise<{
    projects: string[];
    applications: string[];
    environments: string[];
  }> {
    logWithContext.info('Fetching available filters', organizationName);
    return await databricksService.getAvailableFilters(organizationName);
  }

  /**
   * Validate if organization has access to DORA data
   */
  async validateOrganizationAccess(organizationName: string): Promise<boolean> {
    // In development allow bypassing the DB existence check so local testing is easier.
    if (process.env['NODE_ENV'] !== 'production') {
      logWithContext.info('Bypassing organization access check in non-production', organizationName);
      return true;
    }

    return await databricksService.validateOrganizationAccess(organizationName);
  }

  // Private helper methods

  /**
   * Aggregate deployment data based on time period
   */
  private aggregateDeploymentData(
    rawData: any[],
    aggregation: 'daily' | 'weekly' | 'monthly'
  ): any[] {
    // For now, return daily data as-is. You can extend this to handle weekly/monthly aggregation
    if (aggregation === 'daily') {
      return rawData;
    }

    // TODO: Implement weekly and monthly aggregation
    // This would group by week/month and sum deployment counts
    return rawData;
  }

  /**
   * Calculate median from array of numbers
   */
  private calculateMedian(numbers: number[]): number {
    if (numbers.length === 0) return 0;
    
    const sorted = [...numbers].sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);
    
    if (sorted.length % 2 === 0) {
      return (sorted[middle - 1] + sorted[middle]) / 2;
    }
    
    return sorted[middle];
  }

  /**
   * Calculate date range from data or parameters
   */
  private calculateDateRange(
    dates: string[],
    startDate?: string,
    endDate?: string
  ): { start: string; end: string } {
    if (startDate && endDate) {
      return {
        start: startDate,
        end: endDate,
      };
    }

    if (dates.length === 0) {
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return {
        start: thirtyDaysAgo.toISOString(),
        end: now.toISOString(),
      };
    }

    const sortedDates = dates.sort();
    return {
      start: new Date(sortedDates[0]).toISOString(),
      end: new Date(sortedDates[sortedDates.length - 1]).toISOString(),
    };
  }

  /**
   * Extract applied filters from query parameters
   */
  private extractFilters(params: any): Record<string, any> {
    const filters: Record<string, any> = {};

    if (params.projectName) filters.projectName = params.projectName;
    if (params.applicationName) filters.applicationName = params.applicationName;
    if (params.environmentType) filters.environmentType = params.environmentType;
    if (params.startDate) filters.startDate = params.startDate;
    if (params.endDate) filters.endDate = params.endDate;
    if (params.timeRange) filters.timeRange = params.timeRange;

    return filters;
  }
}

// Export singleton instance
export const doraService = new DoraService();