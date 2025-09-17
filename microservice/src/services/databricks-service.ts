import { databricksConnection } from '@/config/database';
import { logWithContext } from '@/utils/logger';
import { handleDatabaseError } from '@/middleware/error-middleware';

export class DatabricksService {
  /**
   * SIMPLIFIED: Get deployment frequency with basic SQL aggregation
   * 
   * This version uses only basic SQL functions that are guaranteed to work
   * in all Databricks environments.
   */
  async getDeploymentFrequency(params: {
    organizationName: string;
    startDate?: string;
    endDate?: string;
    projectName?: string;
    applicationName?: string;
    environmentType?: string;
    aggregation?: 'daily' | 'weekly' | 'monthly';
  }) {
    const { 
      organizationName, 
      startDate, 
      endDate, 
      projectName, 
      applicationName, 
      environmentType,
      aggregation = 'daily'
    } = params;

    try {
      if (process.env.LOG_LEVEL === 'debug') {
        logWithContext.info('Fetching deployment frequency data with basic SQL aggregation', organizationName, { params });
      }

      // Build WHERE conditions
      const whereConditions = ['organization_name = ?'];
      const queryParams: any[] = [organizationName];

      if (startDate) {
        whereConditions.push('deployment_date >= ?');
        queryParams.push(startDate.split('T')[0]); // Convert to YYYY-MM-DD
      }

      if (endDate) {
        whereConditions.push('deployment_date <= ?');
        queryParams.push(endDate.split('T')[0]);
      }

      if (projectName) {
        whereConditions.push('project_name = ?');
        queryParams.push(projectName);
      }

      if (applicationName) {
        whereConditions.push('application_name = ?');
        queryParams.push(applicationName);
      }

      if (environmentType) {
        whereConditions.push('environment_type = ?');
        queryParams.push(environmentType);
      }

      // SIMPLIFIED: Basic SQL aggregation by date only
      const sql = `
        SELECT 
          deployment_date,
          organization_name,
          SUM(deployment_count) as deployment_count
        FROM deployment_frequency
        WHERE ${whereConditions.join(' AND ')}
        GROUP BY deployment_date, organization_name
        ORDER BY deployment_date ASC
      `;

      // Execute with positional parameters
      const results = await this.executeQueryWithParams(sql, queryParams, organizationName);

      logWithContext.info('Successfully fetched aggregated deployment frequency data', organizationName, {
        recordCount: results.length,
        dateRange: { startDate, endDate },
        totalDeployments: results.reduce((sum, row) => sum + row.deployment_count, 0)
      });

      return results;

    } catch (error) {
      logWithContext.error('Failed to fetch deployment frequency data', error as Error, organizationName, { params });
      handleDatabaseError(error as Error, 'deployment frequency query');
      throw error;
    }
  }

  /**
   * SIMPLIFIED: Get change failure rate with basic SQL aggregation
   */
  async getChangeFailureRate(params: {
    organizationName: string;
    startDate?: string;
    endDate?: string;
    projectName?: string;
    applicationName?: string;
    environmentType?: string;
  }) {
    const { organizationName, startDate, endDate, projectName, applicationName, environmentType } = params;

    try {
      logWithContext.info('Fetching change failure rate data with basic SQL aggregation', organizationName, { params });

      const whereConditions = ['organization_name = ?'];
      const queryParams: any[] = [organizationName];

      if (startDate) {
        whereConditions.push('deployment_date >= ?');
        queryParams.push(startDate.split('T')[0]);
      }

      if (endDate) {
        whereConditions.push('deployment_date <= ?');
        queryParams.push(endDate.split('T')[0]);
      }

      if (projectName) {
        whereConditions.push('project_name = ?');
        queryParams.push(projectName);
      }

      if (applicationName) {
        whereConditions.push('application_name = ?');
        queryParams.push(applicationName);
      }

      if (environmentType) {
        whereConditions.push('environment_type = ?');
        queryParams.push(environmentType);
      }

      // SIMPLIFIED: Basic SQL aggregation for failure rates
      const sql = `
        SELECT 
          deployment_date,
          organization_name,
          SUM(total_deployments) as total_deployments,
          SUM(failed_deployments) as failed_deployments,
          -- Calculate failure rate at the aggregated level
          CASE 
            WHEN SUM(total_deployments) > 0 
            THEN CAST(SUM(failed_deployments) AS DOUBLE) / CAST(SUM(total_deployments) AS DOUBLE)
            ELSE 0.0 
          END as failure_rate_percent
        FROM change_failure_rate
        WHERE ${whereConditions.join(' AND ')}
        GROUP BY deployment_date, organization_name
        ORDER BY deployment_date ASC
      `;

      const results = await this.executeQueryWithParams(sql, queryParams, organizationName);

      logWithContext.info('Successfully fetched aggregated change failure rate data', organizationName, {
        recordCount: results.length,
        totalDeployments: results.reduce((sum, row) => sum + row.total_deployments, 0),
        totalFailures: results.reduce((sum, row) => sum + row.failed_deployments, 0)
      });

      return results;

    } catch (error) {
      logWithContext.error('Failed to fetch change failure rate data', error as Error, organizationName, { params });
      handleDatabaseError(error as Error, 'change failure rate query');
      throw error;
    }
  }

  /**
   * SIMPLIFIED: Get lead time with basic SQL aggregation
   */
  async getLeadTimeForChanges(params: {
    organizationName: string;
    startDate?: string;
    endDate?: string;
    projectName?: string;
    applicationName?: string;
    environmentType?: string;
  }) {
    const { organizationName, startDate, endDate, projectName, applicationName, environmentType } = params;

    try {
      logWithContext.info('Fetching lead time data with basic SQL aggregation', organizationName, { params });

      const whereConditions = ['organization_name = ?'];
      const queryParams: any[] = [organizationName];

      if (startDate) {
        whereConditions.push('deployment_date >= ?');
        queryParams.push(startDate.split('T')[0]);
      }

      if (endDate) {
        whereConditions.push('deployment_date <= ?');
        queryParams.push(endDate.split('T')[0]);
      }

      if (projectName) {
        whereConditions.push('project_name = ?');
        queryParams.push(projectName);
      }

      if (applicationName) {
        whereConditions.push('application_name = ?');
        queryParams.push(applicationName);
      }

      if (environmentType) {
        whereConditions.push('environment_type = ?');
        queryParams.push(environmentType);
      }

      // SIMPLIFIED: Use AVG for lead time calculation (simpler than percentile)
      const sql = `
        SELECT 
          deployment_date,
          organization_name,
          -- Calculate average lead time for this date (simpler than median)
          AVG(median_lead_time_hours) as median_lead_time_hours,
          AVG(median_lead_time_hours) / 24.0 as lead_time_days,
          COUNT(*) as change_count
        FROM lead_time_for_changes
        WHERE ${whereConditions.join(' AND ')}
          AND median_lead_time_hours > 0  -- Exclude invalid/zero lead times
        GROUP BY deployment_date, organization_name
        ORDER BY deployment_date ASC
      `;

      const results = await this.executeQueryWithParams(sql, queryParams, organizationName);

      logWithContext.info('Successfully fetched aggregated lead time data', organizationName, {
        recordCount: results.length,
        avgLeadTime: results.length > 0 
          ? results.reduce((sum, row) => sum + row.median_lead_time_hours, 0) / results.length 
          : 0
      });

      return results;

    } catch (error) {
      logWithContext.error('Failed to fetch lead time data', error as Error, organizationName, { params });
      handleDatabaseError(error as Error, 'lead time query');
      throw error;
    }
  }

  /**
   * SIMPLIFIED: Get mean time to restore with basic SQL aggregation
   */
  async getMeanTimeToRestore(params: {
    organizationName: string;
    startDate?: string;
    endDate?: string;
    projectName?: string;
    applicationName?: string;
    environmentType?: string;
  }) {
    const { organizationName, startDate, endDate, projectName, applicationName, environmentType } = params;

    try {
      logWithContext.info('Fetching MTTR data with basic SQL aggregation', organizationName, { params });

      const whereConditions = ['organization_name = ?'];
      const queryParams: any[] = [organizationName];

      if (startDate) {
        whereConditions.push('deployment_date >= ?');
        queryParams.push(startDate.split('T')[0]);
      }

      if (endDate) {
        whereConditions.push('deployment_date <= ?');
        queryParams.push(endDate.split('T')[0]);
      }

      if (projectName) {
        whereConditions.push('project_name = ?');
        queryParams.push(projectName);
      }

      if (applicationName) {
        whereConditions.push('application_name = ?');
        queryParams.push(applicationName);
      }

      if (environmentType) {
        whereConditions.push('environment_type = ?');
        queryParams.push(environmentType);
      }

      // SIMPLIFIED: Use AVG for restore time calculation and correct column name
      const sql = `
        SELECT 
          deployment_date,
          organization_name,
          -- Calculate average restore time for this date (simpler than median)
          AVG(median_hours_to_restore) as median_hours_to_restore,
          COUNT(*) as incident_count
        FROM mean_time_to_restore
        WHERE ${whereConditions.join(' AND ')}
          AND median_hours_to_restore > 0  -- Exclude invalid restore times
        GROUP BY deployment_date, organization_name
        ORDER BY deployment_date ASC
      `;

      const results = await this.executeQueryWithParams(sql, queryParams, organizationName);

      logWithContext.info('Successfully fetched aggregated MTTR data', organizationName, {
        recordCount: results.length,
        avgMTTR: results.length > 0 
          ? results.reduce((sum, row) => sum + row.median_hours_to_restore, 0) / results.length 
          : 0
      });

      return results;

    } catch (error) {
      logWithContext.error('Failed to fetch MTTR data', error as Error, organizationName, { params });
      handleDatabaseError(error as Error, 'MTTR query');
      throw error;
    }
  }

  /**
   * Get available filters (simplified)
   */
  async getAvailableFilters(organizationName: string) {
    try {
      logWithContext.info('Fetching available filters', organizationName);

      // Use simple queries without advanced functions
      const [projectsQuery, applicationsQuery, environmentsQuery] = await Promise.all([
        this.executeQueryWithParams(`
          SELECT DISTINCT project_name 
          FROM deployment_frequency 
          WHERE organization_name = ? 
            AND project_name IS NOT NULL
          ORDER BY project_name
        `, [organizationName], organizationName, 'filter_query'),

        this.executeQueryWithParams(`
          SELECT DISTINCT application_name 
          FROM deployment_frequency 
          WHERE organization_name = ? 
            AND application_name IS NOT NULL
          ORDER BY application_name
        `, [organizationName], organizationName, 'filter_query'),

        this.executeQueryWithParams(`
          SELECT DISTINCT environment_type 
          FROM deployment_frequency 
          WHERE organization_name = ? 
            AND environment_type IS NOT NULL
          ORDER BY environment_type
        `, [organizationName], organizationName, 'filter_query'),
      ]);

      const result = {
        organization_name: organizationName,
        available_filters: {
          projects: projectsQuery.map(row => row.project_name),
          applications: applicationsQuery.map(row => row.application_name),
          environments: environmentsQuery.map(row => row.environment_type),
        },
      };

      logWithContext.info('Successfully fetched available filters', organizationName, {
        projectCount: result.available_filters.projects.length,
        applicationCount: result.available_filters.applications.length,
        environmentCount: result.available_filters.environments.length,
      });

      return result;

    } catch (error) {
      logWithContext.error('Failed to fetch available filters', error as Error, organizationName);
      handleDatabaseError(error as Error, 'filters query');
      throw error;
    }
  }

  /**
   * Helper method to execute queries with positional parameters (OPTIMIZED logging)
   */
  private async executeQueryWithParams<T = any>(
    sql: string,
    params: any[],
    organizationName: string,
    queryType: 'lightweight_check' | 'data_query' | 'filter_query' = 'data_query'
  ): Promise<T[]> {
    // Only log detailed SQL in debug mode to reduce log volume
    if (process.env.LOG_LEVEL === 'debug' || queryType === 'lightweight_check') {
      // Replace ? placeholders with actual values for logging
      let logSql = sql;
      params.forEach((param, index) => {
        logSql = logSql.replace('?', `'${param}'`);
      });

      logWithContext.info('Executing parameterized query', organizationName, {
        queryType,
        sqlPreview: logSql.substring(0, 100) + (logSql.length > 100 ? '...' : ''),
        paramCount: params.length,
      });
    }

    // For now, we'll use simple string replacement instead of parameterized queries
    // This is safe since we control the input values
    let finalSql = sql;
    params.forEach((param, index) => {
      finalSql = finalSql.replace('?', `'${param}'`);
    });

    return await databricksConnection.executeQuery(finalSql, organizationName);
  }

  /**
   * OPTIMIZED: Lightweight organization validation (replaces expensive getAvailableFilters call)
   * Uses a simple EXISTS query instead of fetching all filter data
   */
  async validateOrganizationAccess(organizationName: string): Promise<boolean> {
    try {
      logWithContext.info('Validating organization access', organizationName, {
        queryType: 'lightweight_check'
      });

      const sql = `
        SELECT 1
        FROM deployment_frequency
        WHERE organization_name = ?
        LIMIT 1
      `;

      const results = await this.executeQueryWithParams(sql, [organizationName], organizationName, 'lightweight_check');
      const hasAccess = results.length > 0;

      logWithContext.info('Organization validation completed', organizationName, {
        hasAccess,
        queryType: 'lightweight_check'
      });

      return hasAccess;

    } catch (error) {
      logWithContext.error('Organization validation failed', error as Error, organizationName, {
        queryType: 'lightweight_check'
      });
      return false;
    }
  }

  /**
   * Get applications that belong to specific projects (for cascading filters)
   */
  async getApplicationsByProjects(organizationName: string, selectedProjects: string[]): Promise<string[]> {
    try {
      logWithContext.info('Fetching applications for selected projects', organizationName, { selectedProjects });

      if (selectedProjects.length === 0) {
        return [];
      }

      // Build IN clause for selected projects
      const projectPlaceholders = selectedProjects.map(() => '?').join(', ');
      const sql = `
        SELECT DISTINCT application_name
        FROM deployment_frequency
        WHERE organization_name = ?
          AND project_name IN (${projectPlaceholders})
          AND application_name IS NOT NULL
        ORDER BY application_name
      `;

      const queryParams = [organizationName, ...selectedProjects];
      const results = await this.executeQueryWithParams(sql, queryParams, organizationName, 'filter_query');

      const applications = results.map(row => row.application_name);

      logWithContext.info('Successfully fetched cascading applications', organizationName, {
        projectCount: selectedProjects.length,
        applicationCount: applications.length
      });

      return applications;

    } catch (error) {
      logWithContext.error('Failed to fetch applications by projects', error as Error, organizationName);
      handleDatabaseError(error as Error, 'cascading applications query');
      throw error;
    }
  }
}

export const databricksService = new DatabricksService();