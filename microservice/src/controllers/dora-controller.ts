import { Request, Response } from 'express';
import { doraService } from '@/services/dora-service';
import { logWithContext } from '@/utils/logger';
import { OrganizationAccessError } from '@/middleware/error-middleware';
import { AuthenticatedRequest } from '@/middleware/auth-middleware';

/**
 * FIXED: DORA Controller with proper type handling
 * 
 * Fixes the TypeScript compilation errors by:
 * 1. Properly handling optional parameters
 * 2. Fixing method calls to match service interface
 * 3. Correcting filter access patterns
 */
export class DoraController {
  /**
   * Get deployment frequency metrics
   */
  async getDeploymentFrequency(req: AuthenticatedRequest, res: Response): Promise<void> {
    const organizationName = req.organizationName!;
    const queryParams = req.query as any;

    logWithContext.info('Deployment frequency endpoint called', organizationName, { queryParams });

    const hasAccess = await doraService.validateOrganizationAccess(organizationName);
    if (!hasAccess) {
      throw new OrganizationAccessError(organizationName);
    }

    // FIXED: Create clean parameters object with proper types
    const serviceParams = {
      organizationName,
      // Only include defined parameters to avoid type issues
      ...(queryParams.startDate && { startDate: queryParams.startDate }),
      ...(queryParams.endDate && { endDate: queryParams.endDate }),
      ...(queryParams.projectName && { projectName: queryParams.projectName }),
      ...(queryParams.applicationName && { applicationName: queryParams.applicationName }),
      ...(queryParams.environmentType && { environmentType: queryParams.environmentType }),
      ...(queryParams.timeRange && { timeRange: queryParams.timeRange }),
      ...(queryParams.aggregation && { aggregation: queryParams.aggregation }),
    };

    const result = await doraService.getDeploymentFrequency(serviceParams);

    logWithContext.info('Deployment frequency request completed', organizationName, {
      recordCount: result.data.length,
      totalDeployments: result.summary.total_deployments,
    });

    res.json(result);
  }

  /**
   * Get change failure rate metrics
   */
  async getChangeFailureRate(req: AuthenticatedRequest, res: Response): Promise<void> {
    const organizationName = req.organizationName!;
    const queryParams = req.query as any;

    logWithContext.info('Change failure rate endpoint called', organizationName, { queryParams });

    const hasAccess = await doraService.validateOrganizationAccess(organizationName);
    if (!hasAccess) {
      throw new OrganizationAccessError(organizationName);
    }

    // FIXED: Create clean parameters object
    const serviceParams = {
      organizationName,
      ...(queryParams.startDate && { startDate: queryParams.startDate }),
      ...(queryParams.endDate && { endDate: queryParams.endDate }),
      ...(queryParams.projectName && { projectName: queryParams.projectName }),
      ...(queryParams.applicationName && { applicationName: queryParams.applicationName }),
      ...(queryParams.environmentType && { environmentType: queryParams.environmentType }),
      ...(queryParams.timeRange && { timeRange: queryParams.timeRange }),
    };

    const result = await doraService.getChangeFailureRate(serviceParams);

    logWithContext.info('Change failure rate request completed', organizationName, {
      recordCount: result.data.length,
      overallFailureRate: result.summary.overall_failure_rate,
    });

    res.json(result);
  }

  /**
   * Get lead time for changes metrics
   */
  async getLeadTimeForChanges(req: AuthenticatedRequest, res: Response): Promise<void> {
    const organizationName = req.organizationName!;
    const queryParams = req.query as any;

    logWithContext.info('Lead time for changes endpoint called', organizationName, { queryParams });

    const hasAccess = await doraService.validateOrganizationAccess(organizationName);
    if (!hasAccess) {
      throw new OrganizationAccessError(organizationName);
    }

    // FIXED: Create clean parameters object
    const serviceParams = {
      organizationName,
      ...(queryParams.startDate && { startDate: queryParams.startDate }),
      ...(queryParams.endDate && { endDate: queryParams.endDate }),
      ...(queryParams.projectName && { projectName: queryParams.projectName }),
      ...(queryParams.applicationName && { applicationName: queryParams.applicationName }),
      ...(queryParams.environmentType && { environmentType: queryParams.environmentType }),
      ...(queryParams.timeRange && { timeRange: queryParams.timeRange }),
    };

    const result = await doraService.getLeadTimeForChanges(serviceParams);

    logWithContext.info('Lead time for changes request completed', organizationName, {
      recordCount: result.data.length,
      overallMedianHours: result.summary.overall_median_hours,
    });

    res.json(result);
  }

  /**
   * Get mean time to restore metrics
   */
  async getMeanTimeToRestore(req: AuthenticatedRequest, res: Response): Promise<void> {
    const organizationName = req.organizationName!;
    const queryParams = req.query as any;

    logWithContext.info('Mean time to restore endpoint called', organizationName, { queryParams });

    const hasAccess = await doraService.validateOrganizationAccess(organizationName);
    if (!hasAccess) {
      throw new OrganizationAccessError(organizationName);
    }

    // FIXED: Create clean parameters object
    const serviceParams = {
      organizationName,
      ...(queryParams.startDate && { startDate: queryParams.startDate }),
      ...(queryParams.endDate && { endDate: queryParams.endDate }),
      ...(queryParams.projectName && { projectName: queryParams.projectName }),
      ...(queryParams.applicationName && { applicationName: queryParams.applicationName }),
      ...(queryParams.environmentType && { environmentType: queryParams.environmentType }),
      ...(queryParams.timeRange && { timeRange: queryParams.timeRange }),
    };

    const result = await doraService.getMeanTimeToRestore(serviceParams);

    logWithContext.info('Mean time to restore request completed', organizationName, {
      recordCount: result.data.length,
      overallMedianHours: result.summary.overall_median_hours,
    });

    res.json(result);
  }

  /**
   * FIXED: Get all DORA metrics summary
   * Note: Removed the non-existent getAllDoraMetrics method call
   */
  async getAllMetrics(req: AuthenticatedRequest, res: Response): Promise<void> {
    const organizationName = req.organizationName!;
    const queryParams = req.query as any;

    logWithContext.info('All DORA metrics endpoint called', organizationName, { queryParams });

    const hasAccess = await doraService.validateOrganizationAccess(organizationName);
    if (!hasAccess) {
      throw new OrganizationAccessError(organizationName);
    }

    // Create clean parameters object
    const serviceParams = {
      organizationName,
      ...(queryParams.startDate && { startDate: queryParams.startDate }),
      ...(queryParams.endDate && { endDate: queryParams.endDate }),
      ...(queryParams.projectName && { projectName: queryParams.projectName }),
      ...(queryParams.applicationName && { applicationName: queryParams.applicationName }),
      ...(queryParams.environmentType && { environmentType: queryParams.environmentType }),
      ...(queryParams.timeRange && { timeRange: queryParams.timeRange }),
    };

    // FIXED: Get all metrics individually since getAllDoraMetrics doesn't exist
    const [
      deploymentFrequency,
      changeFailureRate,
      leadTime,
      meanTimeToRestore,
    ] = await Promise.all([
      doraService.getDeploymentFrequency(serviceParams),
      doraService.getChangeFailureRate(serviceParams),
      doraService.getLeadTimeForChanges(serviceParams),
      doraService.getMeanTimeToRestore(serviceParams),
    ]);

    // Combine into summary response
    const result = {
      organization_name: organizationName,
      date_range: deploymentFrequency.summary.date_range,
      metrics: {
        deployment_frequency: {
          average_per_day: deploymentFrequency.summary.average_per_day,
          total_deployments: deploymentFrequency.summary.total_deployments,
        },
        change_failure_rate: {
          failure_rate_percent: changeFailureRate.summary.overall_failure_rate,
          total_deployments: changeFailureRate.summary.total_deployments,
          failed_deployments: changeFailureRate.summary.total_failed_deployments,
        },
        lead_time_for_changes: {
          median_hours: leadTime.summary.overall_median_hours,
          median_days: leadTime.summary.overall_median_days,
          total_changes: leadTime.summary.total_changes || 0,
        },
        mean_time_to_restore: {
          median_hours: meanTimeToRestore.summary.overall_median_hours,
          total_incidents: meanTimeToRestore.summary.total_incidents || 0,
        },
      },
      filters_applied: deploymentFrequency.summary.filters_applied,
    };

    logWithContext.info('All DORA metrics request completed', organizationName, {
      deploymentFrequencyRecords: deploymentFrequency.data.length,
      changeFailureRateRecords: changeFailureRate.data.length,
      leadTimeRecords: leadTime.data.length,
      meanTimeToRestoreRecords: meanTimeToRestore.data.length,
    });

    res.json(result);
  }

  /**
   * Get available filters for the organization
   */
  async getAvailableFilters(req: AuthenticatedRequest, res: Response): Promise<void> {
    const organizationName = req.organizationName!;

    logWithContext.info('Filters endpoint called', organizationName);

    const hasAccess = await doraService.validateOrganizationAccess(organizationName);
    if (!hasAccess) {
      throw new OrganizationAccessError(organizationName);
    }

    const filters = await doraService.getAvailableFilters(organizationName);

    logWithContext.info('Filters request completed', organizationName, {
      // FIXED: Access the correct nested properties
      projectCount: filters.available_filters.projects.length,
      applicationCount: filters.available_filters.applications.length,
      environmentCount: filters.available_filters.environments.length,
    });

    res.json(filters);
  }

  /**
   * Organization health check endpoint
   */
  async getOrganizationHealth(req: AuthenticatedRequest, res: Response): Promise<void> {
    const organizationName = req.organizationName!;

    logWithContext.info('Organization health check called', organizationName);

    try {
      const filters = await doraService.getAvailableFilters(organizationName);
      
      const healthResult = {
        status: 'healthy' as const,
        timestamp: new Date().toISOString(),
        organization: organizationName,
        data_availability: {
          // FIXED: Access the correct nested properties
          projects_count: filters.available_filters.projects.length,
          applications_count: filters.available_filters.applications.length,
          environments_count: filters.available_filters.environments.length,
          has_data: filters.available_filters.projects.length > 0,
        },
      };

      logWithContext.info('Organization health check completed', organizationName, {
        status: healthResult.status,
        hasData: healthResult.data_availability.has_data,
      });

      res.json(healthResult);
    } catch (error) {
      logWithContext.error('Organization health check failed', error as Error, organizationName);
      
      const healthResult = {
        status: 'unhealthy' as const,
        timestamp: new Date().toISOString(),
        organization: organizationName,
        error: 'Unable to access organization data',
      };

      res.status(503).json(healthResult);
    }
  }
}

export const doraController = new DoraController();