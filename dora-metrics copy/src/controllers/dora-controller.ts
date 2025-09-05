import { Response } from 'express';
import { doraService } from '@/services/dora-service';
import { logWithContext } from '@/utils/logger';
import { AuthenticatedRequest } from '@/middleware/auth-middleware';
import { OrganizationAccessError } from '@/middleware/error-middleware';
import {
  DeploymentFrequencyQueryParams,
  ChangeFailureRateQueryParams,
  LeadTimeQueryParams,
  MeanTimeToRestoreQueryParams,
  BaseQueryParams,
} from '@/models/dora-models';

/**
 * DORA Metrics API Controller
 * Handles HTTP requests and responses for DORA metrics endpoints
 */
export class DoraController {

  /**
   * GET /api/v1/dora/:organizationName/deployment-frequency
   * Get deployment frequency metrics
   */
  async getDeploymentFrequency(req: AuthenticatedRequest, res: Response): Promise<void> {
  const organizationName = req.organizationName!;
  const queryParams = req.query as unknown as DeploymentFrequencyQueryParams;

    logWithContext.info('Deployment frequency endpoint called', organizationName, { queryParams });

    // Validate organization access
    const hasAccess = await doraService.validateOrganizationAccess(organizationName);
    if (!hasAccess) {
      throw new OrganizationAccessError(organizationName);
    }

    // Fetch data
    const result = await doraService.getDeploymentFrequency({
      ...queryParams,
      organizationName,
    });

    logWithContext.info('Deployment frequency request completed', organizationName, {
      recordCount: result.data.length,
      totalDeployments: result.summary.total_deployments,
    });

    res.json(result);
  }

  /**
   * GET /api/v1/dora/:organizationName/change-failure-rate
   * Get change failure rate metrics
   */
  async getChangeFailureRate(req: AuthenticatedRequest, res: Response): Promise<void> {
  const organizationName = req.organizationName!;
  const queryParams = req.query as unknown as ChangeFailureRateQueryParams;

    logWithContext.info('Change failure rate endpoint called', organizationName, { queryParams });

    // Validate organization access
    const hasAccess = await doraService.validateOrganizationAccess(organizationName);
    if (!hasAccess) {
      throw new OrganizationAccessError(organizationName);
    }

    // Fetch data
    const result = await doraService.getChangeFailureRate({
      ...queryParams,
      organizationName,
    });

    logWithContext.info('Change failure rate request completed', organizationName, {
      recordCount: result.data.length,
      overallFailureRate: result.summary.overall_failure_rate,
    });

    res.json(result);
  }

  /**
   * GET /api/v1/dora/:organizationName/lead-time-for-changes
   * Get lead time for changes metrics
   */
  async getLeadTimeForChanges(req: AuthenticatedRequest, res: Response): Promise<void> {
  const organizationName = req.organizationName!;
  const queryParams = req.query as unknown as LeadTimeQueryParams;

    logWithContext.info('Lead time for changes endpoint called', organizationName, { queryParams });

    // Validate organization access
    const hasAccess = await doraService.validateOrganizationAccess(organizationName);
    if (!hasAccess) {
      throw new OrganizationAccessError(organizationName);
    }

    // Fetch data
    const result = await doraService.getLeadTimeForChanges({
      ...queryParams,
      organizationName,
    });

    logWithContext.info('Lead time for changes request completed', organizationName, {
      recordCount: result.data.length,
      medianHours: result.summary.overall_median_hours,
    });

    res.json(result);
  }

  /**
   * GET /api/v1/dora/:organizationName/mean-time-to-restore
   * Get mean time to restore metrics
   */
  async getMeanTimeToRestore(req: AuthenticatedRequest, res: Response): Promise<void> {
  const organizationName = req.organizationName!;
  const queryParams = req.query as unknown as MeanTimeToRestoreQueryParams;

    logWithContext.info('Mean time to restore endpoint called', organizationName, { queryParams });

    // Validate organization access
    const hasAccess = await doraService.validateOrganizationAccess(organizationName);
    if (!hasAccess) {
      throw new OrganizationAccessError(organizationName);
    }

    // Fetch data
    const result = await doraService.getMeanTimeToRestore({
      ...queryParams,
      organizationName,
    });

    logWithContext.info('Mean time to restore request completed', organizationName, {
      recordCount: result.data.length,
      medianHours: result.summary.overall_median_hours,
    });

    res.json(result);
  }

  /**
   * GET /api/v1/dora/:organizationName/summary
   * Get all DORA metrics summary
   */
  async getAllMetrics(req: AuthenticatedRequest, res: Response): Promise<void> {
  const organizationName = req.organizationName!;
  const queryParams = req.query as unknown as BaseQueryParams;

    logWithContext.info('All DORA metrics endpoint called', organizationName, { queryParams });

    // Validate organization access
    const hasAccess = await doraService.validateOrganizationAccess(organizationName);
    if (!hasAccess) {
      throw new OrganizationAccessError(organizationName);
    }

    // Fetch all metrics
    const result = await doraService.getAllDoraMetrics({
      ...queryParams,
      organizationName,
    });

    logWithContext.info('All DORA metrics request completed', organizationName, {
      deploymentFrequency: result.metrics.deployment_frequency.average_per_day,
      changeFailureRate: result.metrics.change_failure_rate.failure_rate_percent,
    });

    res.json(result);
  }

  /**
   * GET /api/v1/dora/:organizationName/filters
   * Get available filters for an organization
   */
  async getAvailableFilters(req: AuthenticatedRequest, res: Response): Promise<void> {
    const organizationName = req.organizationName!;

    logWithContext.info('Available filters endpoint called', organizationName);

    // Validate organization access
    const hasAccess = await doraService.validateOrganizationAccess(organizationName);
    if (!hasAccess) {
      throw new OrganizationAccessError(organizationName);
    }

    // Fetch available filters
    const filters = await doraService.getAvailableFilters(organizationName);

    logWithContext.info('Available filters request completed', organizationName, {
      projectCount: filters.projects.length,
      applicationCount: filters.applications.length,
      environmentCount: filters.environments.length,
    });

    res.json({
      organization_name: organizationName,
      available_filters: filters,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * GET /api/v1/dora/:organizationName/health
   * Health check for specific organization data
   */
  async getOrganizationHealth(req: AuthenticatedRequest, res: Response): Promise<void> {
    const organizationName = req.organizationName!;

    logWithContext.info('Organization health check endpoint called', organizationName);

    try {
      // Check if organization has data
      const hasAccess = await doraService.validateOrganizationAccess(organizationName);
      
      // Get available filters to check data diversity
      const filters = hasAccess ? await doraService.getAvailableFilters(organizationName) : null;

      const healthStatus = {
        organization_name: organizationName,
        status: hasAccess ? 'healthy' : 'no_data',
        has_data: hasAccess,
        data_summary: filters ? {
          projects_count: filters.projects.length,
          applications_count: filters.applications.length,
          environments_count: filters.environments.length,
        } : null,
        timestamp: new Date().toISOString(),
      };

      logWithContext.info('Organization health check completed', organizationName, {
        status: healthStatus.status,
        hasData: hasAccess,
      });

      res.status(hasAccess ? 200 : 404).json(healthStatus);
    } catch (error) {
      logWithContext.error('Organization health check failed', error as Error, organizationName);

      res.status(503).json({
        organization_name: organizationName,
        status: 'unhealthy',
        has_data: false,
        error: 'Health check failed',
        timestamp: new Date().toISOString(),
      });
    }
  }
}

// Export singleton instance
export const doraController = new DoraController();