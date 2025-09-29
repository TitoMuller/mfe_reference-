// Fixed dora-service.ts - Simplified since DB now does aggregation

import { databricksService } from './databricks-service';
import { logWithContext } from '@/utils/logger';
import { 
  DeploymentFrequencyResponse,
  ChangeFailureRateResponse,
  LeadTimeResponse,
  MeanTimeToRestoreResponse
} from '@/models/dora-models';

export class DoraService {
  /**
   * SIMPLIFIED: Get deployment frequency data
   * 
   * Since the database now returns properly aggregated data by date,
   * we no longer need complex frontend aggregation logic.
   */
  async getDeploymentFrequency(params: {
    organizationName: string;
    startDate?: string;
    endDate?: string;
    projectName?: string;
    applicationName?: string;
    environmentType?: string;
    aggregation?: 'daily' | 'weekly' | 'monthly';
  }): Promise<DeploymentFrequencyResponse> {
    const { organizationName, ...queryParams } = params;

    if (process.env.LOG_LEVEL === 'debug') {
      logWithContext.info('Processing deployment frequency request', organizationName, { params });
    }

    // Get pre-aggregated data from database
    const rawData = await databricksService.getDeploymentFrequency({
      organizationName,
      ...queryParams,
    });

    // Simple transformation - no aggregation needed!
    const totalDeployments = rawData.reduce((sum, row) => sum + row.deployment_count, 0);
    const uniqueDays = rawData.length; // Each row is already a unique day
    const averagePerDay = uniqueDays > 0 ? totalDeployments / uniqueDays : 0;
    
    const dateRange = this.calculateDateRange(
      rawData.map(r => r.deployment_date), 
      queryParams.startDate, 
      queryParams.endDate
    );

    const response: DeploymentFrequencyResponse = {
      metric: 'deployment_frequency',
      data: rawData.map(row => ({
        date: row.deployment_date,
        organization_name: row.organization_name,
        deployment_count: row.deployment_count,
        daily_average: row.deployment_count, // For daily aggregation
        // Include aggregation context for enhanced tooltips
        project_count: row.project_count,
        application_count: row.application_count,
        environment_count: row.environment_count,
        projects: row.projects,
        applications: row.applications,
        environments: row.environments,
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
   * SIMPLIFIED: Get change failure rate data
   */
  async getChangeFailureRate(params: {
    organizationName: string;
    startDate?: string;
    endDate?: string;
    projectName?: string;
    applicationName?: string;
    environmentType?: string;
  }): Promise<ChangeFailureRateResponse> {
    const { organizationName, ...queryParams } = params;

    if (process.env.LOG_LEVEL === 'debug') {
      logWithContext.info('Processing change failure rate request', organizationName, { params });
    }

    // Get pre-aggregated data from database
    const rawData = await databricksService.getChangeFailureRate({
      organizationName,
      ...queryParams,
    });

    const totalDeployments = rawData.reduce((sum, row) => sum + row.total_deployments, 0);
    const totalFailedDeployments = rawData.reduce((sum, row) => sum + row.failed_deployments, 0);
    const overallFailureRate = totalDeployments > 0 ? totalFailedDeployments / totalDeployments : 0;

    const dateRange = this.calculateDateRange(
      rawData.map(r => r.deployment_date),
      queryParams.startDate,
      queryParams.endDate
    );

    const response: ChangeFailureRateResponse = {
      metric: 'change_failure_rate',
      data: rawData.map(row => ({
        date: row.deployment_date,
        organization_name: row.organization_name,
        total_deployments: row.total_deployments,
        failed_deployments: row.failed_deployments,
        failure_rate_percent: row.failure_rate_percent,
        // Include aggregation context
        project_count: row.project_count,
        application_count: row.application_count,
        projects: row.projects,
        applications: row.applications,
        environments: row.environments,
      })),
      summary: {
        organization_name: organizationName,
        overall_failure_rate: Math.round(overallFailureRate * 10000) / 100, // Convert to percentage
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
   * SIMPLIFIED: Get lead time data
   */
  async getLeadTimeForChanges(params: {
    organizationName: string;
    startDate?: string;
    endDate?: string;
    projectName?: string;
    applicationName?: string;
    environmentType?: string;
  }): Promise<LeadTimeResponse> {
    const { organizationName, ...queryParams } = params;

    if (process.env.LOG_LEVEL === 'debug') {
      logWithContext.info('Processing lead time request', organizationName, { params });
    }

    // Get pre-aggregated data from database
    const rawData = await databricksService.getLeadTimeForChanges({
      organizationName,
      ...queryParams,
    });

    // Calculate overall median from the daily medians (weighted by change count)
    const totalChanges = rawData.reduce((sum, row) => sum + row.change_count, 0);
    const weightedSum = rawData.reduce((sum, row) => 
      sum + (row.median_lead_time_hours * row.change_count), 0
    );
    const overallMedianHours = totalChanges > 0 ? weightedSum / totalChanges : 0;

    const dateRange = this.calculateDateRange(
      rawData.map(r => r.deployment_date),
      queryParams.startDate,
      queryParams.endDate
    );

    const response: LeadTimeResponse = {
      metric: 'lead_time_for_changes',
      data: rawData.map(row => ({
        date: row.deployment_date,
        organization_name: row.organization_name,
        median_lead_time_hours: row.median_lead_time_hours,
        lead_time_days: row.lead_time_days,
        // Include aggregation context
        change_count: row.change_count,
        project_count: row.project_count,
        application_count: row.application_count,
        projects: row.projects,
        applications: row.applications,
        environments: row.environments,
      })),
      summary: {
        organization_name: organizationName,
        overall_median_hours: Math.round(overallMedianHours * 100) / 100,
        overall_median_days: Math.round((overallMedianHours / 24) * 100) / 100,
        total_changes: totalChanges,
        date_range: dateRange,
        filters_applied: this.extractFilters(queryParams),
      },
    };

    logWithContext.info('Successfully processed lead time request', organizationName, {
      recordCount: response.data.length,
      overallMedianHours: response.summary.overall_median_hours,
    });

    return response;
  }

  /**
   * SIMPLIFIED: Get mean time to restore data
   */
  async getMeanTimeToRestore(params: {
    organizationName: string;
    startDate?: string;
    endDate?: string;
    projectName?: string;
    applicationName?: string;
    environmentType?: string;
  }): Promise<MeanTimeToRestoreResponse> {
    const { organizationName, ...queryParams } = params;

    if (process.env.LOG_LEVEL === 'debug') {
      logWithContext.info('Processing MTTR request', organizationName, { params });
    }

    // Get pre-aggregated data from database
    const rawData = await databricksService.getMeanTimeToRestore({
      organizationName,
      ...queryParams,
    });

    // Calculate overall median from the daily medians (weighted by incident count)
    const totalIncidents = rawData.reduce((sum, row) => sum + row.incident_count, 0);
    const weightedSum = rawData.reduce((sum, row) => 
      sum + (row.median_hours_to_restore * row.incident_count), 0
    );
    const overallMedianHours = totalIncidents > 0 ? weightedSum / totalIncidents : 0;

    const dateRange = this.calculateDateRange(
      rawData.map(r => r.deployment_date),
      queryParams.startDate,
      queryParams.endDate
    );

    const response: MeanTimeToRestoreResponse = {
      metric: 'mean_time_to_restore',
      data: rawData.map(row => ({
        date: row.deployment_date,
        organization_name: row.organization_name,
        median_hours_to_restore: row.median_hours_to_restore,
        // Include aggregation context
        incident_count: row.incident_count,
        project_count: row.project_count,
        application_count: row.application_count,
        projects: row.projects,
        applications: row.applications,
        environments: row.environments,
      })),
      summary: {
        organization_name: organizationName,
        overall_median_hours: Math.round(overallMedianHours * 100) / 100,
        total_incidents: totalIncidents,
        date_range: dateRange,
        filters_applied: this.extractFilters(queryParams),
      },
    };

    logWithContext.info('Successfully processed MTTR request', organizationName, {
      recordCount: response.data.length,
      overallMedianHours: response.summary.overall_median_hours,
    });

    return response;
  }

  /**
   * Validate organization access using lightweight database check
   */
  async validateOrganizationAccess(organizationName: string): Promise<boolean> {
    try {
      return await databricksService.validateOrganizationAccess(organizationName);
    } catch (error) {
      logWithContext.error('Organization validation failed', error as Error, organizationName);
      return false;
    }
  }

  /**
   * Get available filters
   */
  async getAvailableFilters(organizationName: string) {
    return await databricksService.getAvailableFilters(organizationName);
  }

  /**
   * Get applications that belong to specific projects (for cascading filters)
   */
  async getCascadingApplications(organizationName: string, selectedProjects: string[]): Promise<string[]> {
    logWithContext.info('Getting cascading applications', organizationName, { selectedProjects });

    try {
      // Get applications filtered by the selected projects
      const applications = await databricksService.getApplicationsByProjects(organizationName, selectedProjects);

      logWithContext.info('Successfully retrieved cascading applications', organizationName, {
        projectCount: selectedProjects.length,
        applicationCount: applications.length
      });

      return applications;
    } catch (error) {
      logWithContext.error('Failed to get cascading applications', error as Error, organizationName);
      throw error;
    }
  }

  // Helper methods (unchanged)
  private calculateDateRange(dates: string[], startDate?: string, endDate?: string) {
    const sortedDates = [...dates].sort();
    return {
      start: startDate || (sortedDates[0] ? `${sortedDates[0]}T00:00:00.000Z` : new Date().toISOString()),
      end: endDate || (sortedDates[sortedDates.length - 1] ? `${sortedDates[sortedDates.length - 1]}T23:59:59.999Z` : new Date().toISOString()),
    };
  }

  private extractFilters(params: any) {
    const { organizationName, aggregation, ...filters } = params;
    return Object.fromEntries(
      Object.entries(filters).filter(([_, value]) => value !== undefined)
    );
  }
}

export const doraService = new DoraService();