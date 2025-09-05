import { databricksConnection } from '@/config/database';
import { config } from '@/config/environment';
import { handleDatabaseError } from '@/middleware/error-middleware';
import { logWithContext } from '@/utils/logger';
import {
  DeploymentFrequencyRow,
  ChangeFailureRateRow,
  LeadTimeForChangesRow,
  MeanTimeToRestoreRow,
  BaseQueryParams,
} from '@/models/dora-models';

/**
 * Databricks Data Access Layer
 * Handles all database interactions with proper error handling and logging
 */
export class DatabricksService {
  private readonly catalogSchema: string;

  constructor() {
    this.catalogSchema = `${config.DATABRICKS_CATALOG}.${config.DATABRICKS_SCHEMA}`;
  }

  /**
   * Get deployment frequency data from the gold table
   */
  async getDeploymentFrequency(params: {
    organizationName: string;
    startDate?: string;
    endDate?: string;
    projectName?: string;
    applicationName?: string;
    environmentType?: string;
    aggregation?: 'daily' | 'weekly' | 'monthly';
  }): Promise<DeploymentFrequencyRow[]> {
    const { organizationName, startDate, endDate, projectName, applicationName, environmentType } = params;

    try {
      logWithContext.info('Fetching deployment frequency data', organizationName, { params });

      // Build WHERE clause dynamically
      const whereConditions: string[] = ['organization_name = ${organizationName}'];
      const queryParams: Record<string, any> = { organizationName };

      if (startDate) {
        whereConditions.push('deployment_date >= ${startDate}');
        queryParams.startDate = startDate.split('T')[0]; // Extract date part
      }

      if (endDate) {
        whereConditions.push('deployment_date <= ${endDate}');
        queryParams.endDate = endDate.split('T')[0]; // Extract date part
      }

      if (projectName) {
        whereConditions.push('project_name = ${projectName}');
        queryParams.projectName = projectName;
      }

      if (applicationName) {
        whereConditions.push('application_name = ${applicationName}');
        queryParams.applicationName = applicationName;
      }

      if (environmentType) {
        whereConditions.push('environment_type = ${environmentType}');
        queryParams.environmentType = environmentType;
      }

      const sql = `
        SELECT 
          deployment_date,
          organization_name,
          project_name,
          application_name,
          environment_type,
          deployment_count,
          deployment_timestamp,
          organization_created_date
        FROM ${this.catalogSchema}.deployment_frequency
        WHERE ${whereConditions.join(' AND ')}
        ORDER BY deployment_date DESC, project_name, application_name
        LIMIT 10000
      `;

      const results = await databricksConnection.executeQuery<DeploymentFrequencyRow>(
        sql,
        organizationName,
        queryParams
      );

      logWithContext.info('Successfully fetched deployment frequency data', organizationName, {
        recordCount: results.length,
        dateRange: { startDate, endDate },
      });

      return results;
    } catch (error) {
      logWithContext.error('Failed to fetch deployment frequency data', error as Error, organizationName, { params });
  handleDatabaseError(error as Error, 'deployment frequency query');
  throw error;
    }
  }

  /**
   * Get change failure rate data from the gold table
   */
  async getChangeFailureRate(params: {
    organizationName: string;
    startDate?: string;
    endDate?: string;
    projectName?: string;
    applicationName?: string;
    environmentType?: string;
  }): Promise<ChangeFailureRateRow[]> {
    const { organizationName, startDate, endDate, projectName, applicationName, environmentType } = params;

    try {
      logWithContext.info('Fetching change failure rate data', organizationName, { params });

      const whereConditions: string[] = ['organization_name = ${organizationName}'];
      const queryParams: Record<string, any> = { organizationName };

      if (startDate) {
        whereConditions.push('deployment_date >= ${startDate}');
        queryParams.startDate = startDate.split('T')[0];
      }

      if (endDate) {
        whereConditions.push('deployment_date <= ${endDate}');
        queryParams.endDate = endDate.split('T')[0];
      }

      if (projectName) {
        whereConditions.push('project_name = ${projectName}');
        queryParams.projectName = projectName;
      }

      if (applicationName) {
        whereConditions.push('application_name = ${applicationName}');
        queryParams.applicationName = applicationName;
      }

      if (environmentType) {
        whereConditions.push('environment_type = ${environmentType}');
        queryParams.environmentType = environmentType;
      }

      const sql = `
        SELECT 
          deployment_date,
          organization_name,
          project_name,
          application_name,
          environment_type,
          total_deployments,
          failed_deployments,
          change_failure_rate_percent,
          deployment_timestamp,
          organization_created_date
        FROM ${this.catalogSchema}.change_failure_rate
        WHERE ${whereConditions.join(' AND ')}
        ORDER BY deployment_date DESC, project_name, application_name
        LIMIT 10000
      `;

      const results = await databricksConnection.executeQuery<ChangeFailureRateRow>(
        sql,
        organizationName,
        queryParams
      );

      logWithContext.info('Successfully fetched change failure rate data', organizationName, {
        recordCount: results.length,
      });

      return results;
    } catch (error) {
      logWithContext.error('Failed to fetch change failure rate data', error as Error, organizationName, { params });
  handleDatabaseError(error as Error, 'change failure rate query');
  throw error;
    }
  }

  /**
   * Get lead time for changes data from the gold table
   */
  async getLeadTimeForChanges(params: {
    organizationName: string;
    startDate?: string;
    endDate?: string;
    projectName?: string;
    applicationName?: string;
    environmentType?: string;
  }): Promise<LeadTimeForChangesRow[]> {
    const { organizationName, startDate, endDate, projectName, applicationName, environmentType } = params;

    try {
      logWithContext.info('Fetching lead time for changes data', organizationName, { params });

      const whereConditions: string[] = ['organization_name = ${organizationName}'];
      const queryParams: Record<string, any> = { organizationName };

      if (startDate) {
        whereConditions.push('deployment_date >= ${startDate}');
        queryParams.startDate = startDate.split('T')[0];
      }

      if (endDate) {
        whereConditions.push('deployment_date <= ${endDate}');
        queryParams.endDate = endDate.split('T')[0];
      }

      if (projectName) {
        whereConditions.push('project_name = ${projectName}');
        queryParams.projectName = projectName;
      }

      if (applicationName) {
        whereConditions.push('application_name = ${applicationName}');
        queryParams.applicationName = applicationName;
      }

      if (environmentType) {
        whereConditions.push('environment_type = ${environmentType}');
        queryParams.environmentType = environmentType;
      }

      const sql = `
        SELECT 
          organization_name,
          project_name,
          application_name,
          environment_type,
          deployment_date,
          deployedAt,
          median_lead_time_hours
        FROM ${this.catalogSchema}.lead_time_for_changes
        WHERE ${whereConditions.join(' AND ')}
        ORDER BY deployment_date DESC, project_name, application_name
        LIMIT 10000
      `;

      const results = await databricksConnection.executeQuery<LeadTimeForChangesRow>(
        sql,
        organizationName,
        queryParams
      );

      logWithContext.info('Successfully fetched lead time for changes data', organizationName, {
        recordCount: results.length,
      });

      return results;
    } catch (error) {
      logWithContext.error('Failed to fetch lead time for changes data', error as Error, organizationName, { params });
  handleDatabaseError(error as Error, 'lead time for changes query');
  throw error;
    }
  }

  /**
   * Get mean time to restore data from the gold table
   */
  async getMeanTimeToRestore(params: {
    organizationName: string;
    startDate?: string;
    endDate?: string;
    projectName?: string;
    applicationName?: string;
    environmentType?: string;
  }): Promise<MeanTimeToRestoreRow[]> {
    const { organizationName, startDate, endDate, projectName, applicationName, environmentType } = params;

    try {
      logWithContext.info('Fetching mean time to restore data', organizationName, { params });

      const whereConditions: string[] = ['organization_name = ${organizationName}'];
      const queryParams: Record<string, any> = { organizationName };

      if (startDate) {
        whereConditions.push('deployment_date >= ${startDate}');
        queryParams.startDate = startDate.split('T')[0];
      }

      if (endDate) {
        whereConditions.push('deployment_date <= ${endDate}');
        queryParams.endDate = endDate.split('T')[0];
      }

      if (projectName) {
        whereConditions.push('project_name = ${projectName}');
        queryParams.projectName = projectName;
      }

      if (applicationName) {
        whereConditions.push('application_name = ${applicationName}');
        queryParams.applicationName = applicationName;
      }

      if (environmentType) {
        whereConditions.push('environment_type = ${environmentType}');
        queryParams.environmentType = environmentType;
      }

      const sql = `
        SELECT 
          deployment_date,
          organization_name,
          project_name,
          application_name,
          environment_type,
          median_hours_to_restore,
          deployedAt
        FROM ${this.catalogSchema}.mean_time_to_restore
        WHERE ${whereConditions.join(' AND ')}
        ORDER BY deployment_date DESC, project_name, application_name
        LIMIT 10000
      `;

      const results = await databricksConnection.executeQuery<MeanTimeToRestoreRow>(
        sql,
        organizationName,
        queryParams
      );

      logWithContext.info('Successfully fetched mean time to restore data', organizationName, {
        recordCount: results.length,
      });

      return results;
    } catch (error) {
      logWithContext.error('Failed to fetch mean time to restore data', error as Error, organizationName, { params });
  handleDatabaseError(error as Error, 'mean time to restore query');
  throw error;
    }
  }

  /**
   * Get summary statistics for all DORA metrics
   */
  async getDoraMetricsSummary(params: {
    organizationName: string;
    startDate?: string;
    endDate?: string;
    projectName?: string;
    applicationName?: string;
    environmentType?: string;
  }): Promise<{
    deploymentFrequency: { totalDeployments: number; averagePerDay: number };
    changeFailureRate: { overallRate: number; totalDeployments: number; failedDeployments: number };
    leadTime: { medianHours: number; medianDays: number };
    meanTimeToRestore: { medianHours: number; medianDays: number };
  }> {
    const { organizationName } = params;

    try {
      logWithContext.info('Fetching DORA metrics summary', organizationName, { params });

      // Run all queries in parallel for better performance
      const [deploymentData, changeFailureData, leadTimeData, mttrData] = await Promise.all([
        this.getDeploymentFrequency(params),
        this.getChangeFailureRate(params),
        this.getLeadTimeForChanges(params),
        this.getMeanTimeToRestore(params),
      ]);

  // Calculate deployment frequency metrics
  const totalDeployments = deploymentData.reduce((sum, row) => sum + row.deployment_count, 0);
  // Determine start/end for the date range (prefer explicit params, fallback to data)
  const dates = deploymentData.map(row => row.deployment_date).filter(Boolean);
  const start = params.startDate ? new Date(params.startDate) : (dates.length ? new Date(dates.sort()[dates.length - 1]) : new Date());
  const end = params.endDate ? new Date(params.endDate) : (dates.length ? new Date(dates.sort()[0]) : new Date());
  const msPerDay = 24 * 60 * 60 * 1000;
  const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / msPerDay));
  const averagePerDay = totalDeployments > 0 ? totalDeployments / days : 0;

      // Calculate change failure rate metrics
      const totalDeploymentsForCFR = changeFailureData.reduce((sum, row) => sum + row.total_deployments, 0);
      const totalFailedDeployments = changeFailureData.reduce((sum, row) => sum + row.failed_deployments, 0);
      const overallChangeFailureRate = totalDeploymentsForCFR > 0 
        ? (totalFailedDeployments / totalDeploymentsForCFR) * 100 
        : 0;

      // Calculate lead time metrics
      const leadTimes = leadTimeData.map(row => row.median_lead_time_hours).filter(time => time > 0);
      const medianLeadTimeHours = leadTimes.length > 0 
        ? leadTimes.sort((a, b) => a - b)[Math.floor(leadTimes.length / 2)]
        : 0;

      // Calculate MTTR metrics
      const mttrTimes = mttrData.map(row => row.median_hours_to_restore).filter(time => time > 0);
      const medianMttrHours = mttrTimes.length > 0
        ? mttrTimes.sort((a, b) => a - b)[Math.floor(mttrTimes.length / 2)]
        : 0;

      const summary = {
        deploymentFrequency: {
          totalDeployments,
          averagePerDay: Math.round(averagePerDay * 100) / 100,
        },
        changeFailureRate: {
          overallRate: Math.round(overallChangeFailureRate * 100) / 100,
          totalDeployments: totalDeploymentsForCFR,
          failedDeployments: totalFailedDeployments,
        },
        leadTime: {
          medianHours: Math.round(medianLeadTimeHours * 100) / 100,
          medianDays: Math.round((medianLeadTimeHours / 24) * 100) / 100,
        },
        meanTimeToRestore: {
          medianHours: Math.round(medianMttrHours * 100) / 100,
          medianDays: Math.round((medianMttrHours / 24) * 100) / 100,
        },
      };

      logWithContext.info('Successfully calculated DORA metrics summary', organizationName, { summary });

      return summary;
    } catch (error) {
      logWithContext.error('Failed to fetch DORA metrics summary', error as Error, organizationName, { params });
  handleDatabaseError(error as Error, 'DORA metrics summary query');
  throw error;
    }
  }

  /**
   * Check if organization has data in the tables
   */
  async validateOrganizationAccess(organizationName: string): Promise<boolean> {
    try {
      const sql = `
        SELECT COUNT(*) as record_count
        FROM ${this.catalogSchema}.deployment_frequency
        WHERE organization_name = ${organizationName}
        LIMIT 1
      `;

      const results = await databricksConnection.executeQuery<{ record_count: number }>(
        sql,
        organizationName,
        { organizationName }
      );

      const hasData = results.length > 0 && results[0].record_count > 0;

      logWithContext.info(`Organization access validation`, organizationName, { 
        hasData,
        recordCount: results[0]?.record_count || 0 
      });

      return hasData;
    } catch (error) {
      logWithContext.error('Failed to validate organization access', error as Error, organizationName);
      return false;
    }
  }

  /**
   * Get available filters for an organization (projects, applications, environments)
   */
  async getAvailableFilters(organizationName: string): Promise<{
    projects: string[];
    applications: string[];
    environments: string[];
  }> {
    try {
      logWithContext.info('Fetching available filters', organizationName);

      const sql = `
        SELECT DISTINCT 
          project_name,
          application_name,
          environment_type
        FROM ${this.catalogSchema}.deployment_frequency
        WHERE organization_name = ${organizationName}
        ORDER BY project_name, application_name, environment_type
      `;

      const results = await databricksConnection.executeQuery<{
        project_name: string;
        application_name: string;
        environment_type: string;
      }>(sql, organizationName, { organizationName });

      const projects = [...new Set(results.map(r => r.project_name))].filter(Boolean);
      const applications = [...new Set(results.map(r => r.application_name))].filter(Boolean);
      const environments = [...new Set(results.map(r => r.environment_type))].filter(Boolean);

      const filters = { projects, applications, environments };

      logWithContext.info('Successfully fetched available filters', organizationName, filters);

      return filters;
    } catch (error) {
      logWithContext.error('Failed to fetch available filters', error as Error, organizationName);
  handleDatabaseError(error as Error, 'available filters query');
  throw error;
    }
  }
}

// Export singleton instance
export const databricksService = new DatabricksService();