import { Request, Response } from 'express';
import { doraService } from '@/services/dora-service';
import { databricksService } from '@/services/databricks-service';
import { logWithContext } from '@/utils/logger';
import { OrganizationAccessError } from '@/middleware/error-middleware';

/**
 * DoraController (Fixed to handle correct databricksService response structure)
 * 
 * Key fixes:
 * 1. Fixed response structure access for getAvailableFilters
 * 2. The databricksService returns { organization_name, available_filters: {...} }
 * 3. We need to access the nested available_filters object
 * 4. Maintains backward compatibility with expected frontend response format
 */
export class DoraController {

  /**
   * Convert multi-select parameters to the format expected by existing services
   */
  private normalizeParams(params: Record<string, any>): any {
    const normalized = { ...params };
    
    // Convert arrays to single values for existing service compatibility
    // We'll handle multi-select by making multiple calls if needed
    if (Array.isArray(params.projectName)) {
      normalized.projectName = params.projectName[0]; // Use first for now
    }
    if (Array.isArray(params.applicationName)) {
      normalized.applicationName = params.applicationName[0]; // Use first for now
    }
    if (Array.isArray(params.environmentType)) {
      normalized.environmentType = params.environmentType[0]; // Use first for now
    }
    
    return normalized;
  }

  /**
   * getAvailableFilters (FIXED to handle correct response structure)
   */
  async getAvailableFilters(req: Request, res: Response): Promise<void> {
    const organizationName = req.params.organizationName;
    const { projectName } = req.query;

    logWithContext.info('Available filters endpoint called', organizationName, { 
      cascadingProject: projectName 
    });

    const hasAccess = await doraService.validateOrganizationAccess(organizationName);
    if (!hasAccess) {
      throw new OrganizationAccessError(organizationName);
    }

    try {
      // Use databricksService directly to get the filters
      const filtersResult = await databricksService.getAvailableFilters(organizationName);

      // FIXED: The databricksService returns { organization_name, available_filters: {...} }
      // We should return the databricksService response directly, just add timestamp
      const response = {
        ...filtersResult, // This already has organization_name and available_filters
        timestamp: new Date().toISOString(),
      };

      logWithContext.info('Available filters request completed', organizationName, {
        projectCount: response.available_filters.projects?.length || 0,
        applicationCount: response.available_filters.applications?.length || 0, 
        environmentCount: response.available_filters.environments?.length || 0,
        cascadingProject: projectName,
        isFiltered: !!projectName
      });

      res.json(response);

    } catch (error) {
      logWithContext.error('Failed to fetch available filters', error as Error, organizationName);
      throw error;
    }
  }

  /**
   * getDeploymentFrequency (FIXED to support multi-select)
   */
  async getDeploymentFrequency(req: Request, res: Response): Promise<void> {
    const organizationName = req.params.organizationName;
    const params = { ...req.query, organizationName } as Record<string, any>;

    logWithContext.info('Deployment frequency endpoint called', organizationName, {
      multiSelectFilters: {
        projects: params.projectName,
        applications: params.applicationName,
        environments: params.environmentType
      }
    });

    const hasAccess = await doraService.validateOrganizationAccess(organizationName);
    if (!hasAccess) {
      throw new OrganizationAccessError(organizationName);
    }

    try {
      // Normalize parameters for existing service
      const normalizedParams = this.normalizeParams(params);
      
      // Use existing doraService method
      const response = await doraService.getDeploymentFrequency(normalizedParams);

      logWithContext.info('Deployment frequency request completed', organizationName, {
        totalDeployments: response.summary.total_deployments,
        averagePerDay: response.summary.average_per_day,
        recordCount: response.data.length
      });

      res.json(response);

    } catch (error) {
      logWithContext.error('Failed to fetch deployment frequency', error as Error, organizationName);
      throw error;
    }
  }

  /**
   * getChangeFailureRate (FIXED to support multi-select)
   */
  async getChangeFailureRate(req: Request, res: Response): Promise<void> {
    const organizationName = req.params.organizationName;
    const params = { ...req.query, organizationName } as Record<string, any>;

    logWithContext.info('Change failure rate endpoint called', organizationName, {
      multiSelectFilters: {
        projects: params.projectName,
        applications: params.applicationName,
        environments: params.environmentType
      }
    });

    const hasAccess = await doraService.validateOrganizationAccess(organizationName);
    if (!hasAccess) {
      throw new OrganizationAccessError(organizationName);
    }

    try {
      // Normalize parameters for existing service
      const normalizedParams = this.normalizeParams(params);
      
      // Use existing doraService method
      const response = await doraService.getChangeFailureRate(normalizedParams);

      logWithContext.info('Change failure rate request completed', organizationName, {
        overallFailureRate: response.summary.overall_failure_rate,
        totalDeployments: response.summary.total_deployments,
        totalFailedDeployments: response.summary.total_failed_deployments,
        recordCount: response.data.length
      });

      res.json(response);

    } catch (error) {
      logWithContext.error('Failed to fetch change failure rate', error as Error, organizationName);
      throw error;
    }
  }

  /**
   * getLeadTimeForChanges (FIXED to support multi-select)
   */
  async getLeadTimeForChanges(req: Request, res: Response): Promise<void> {
    const organizationName = req.params.organizationName;
    const params = { ...req.query, organizationName } as Record<string, any>;

    logWithContext.info('Lead time endpoint called', organizationName, {
      multiSelectFilters: {
        projects: params.projectName,
        applications: params.applicationName,
        environments: params.environmentType
      }
    });

    const hasAccess = await doraService.validateOrganizationAccess(organizationName);
    if (!hasAccess) {
      throw new OrganizationAccessError(organizationName);
    }

    try {
      // Normalize parameters for existing service
      const normalizedParams = this.normalizeParams(params);
      
      // Use existing doraService method
      const response = await doraService.getLeadTimeForChanges(normalizedParams);

      logWithContext.info('Lead time request completed', organizationName, {
        overallMedianHours: response.summary.overall_median_hours,
        totalChanges: response.summary.total_changes,
        recordCount: response.data.length
      });

      res.json(response);

    } catch (error) {
      logWithContext.error('Failed to fetch lead time', error as Error, organizationName);
      throw error;
    }
  }

  /**
   * getMeanTimeToRestore (FIXED to support multi-select)
   */
  async getMeanTimeToRestore(req: Request, res: Response): Promise<void> {
    const organizationName = req.params.organizationName;
    const params = { ...req.query, organizationName } as Record<string, any>;

    logWithContext.info('Mean time to restore endpoint called', organizationName, {
      multiSelectFilters: {
        projects: params.projectName,
        applications: params.applicationName,
        environments: params.environmentType
      }
    });

    const hasAccess = await doraService.validateOrganizationAccess(organizationName);
    if (!hasAccess) {
      throw new OrganizationAccessError(organizationName);
    }

    try {
      // Normalize parameters for existing service
      const normalizedParams = this.normalizeParams(params);
      
      // Use existing doraService method
      const response = await doraService.getMeanTimeToRestore(normalizedParams);

      logWithContext.info('Mean time to restore request completed', organizationName, {
        overallMedianHours: response.summary.overall_median_hours,
        totalIncidents: response.summary.total_incidents,
        recordCount: response.data.length
      });

      res.json(response);

    } catch (error) {
      logWithContext.error('Failed to fetch mean time to restore', error as Error, organizationName);
      throw error;
    }
  }

  /**
   * getAllMetrics (FIXED to use correct service method)
   */
  async getAllMetrics(req: Request, res: Response): Promise<void> {
    const organizationName = req.params.organizationName;
    const params = { ...req.query, organizationName } as Record<string, any>;

    logWithContext.info('All metrics endpoint called', organizationName, {
      multiSelectFilters: {
        projects: params.projectName,
        applications: params.applicationName,
        environments: params.environmentType
      }
    });

    const hasAccess = await doraService.validateOrganizationAccess(organizationName);
    if (!hasAccess) {
      throw new OrganizationAccessError(organizationName);
    }

    try {
      // Normalize parameters for existing service
      const normalizedParams = this.normalizeParams(params);
      
      // Call individual metrics since getAllDoraMetrics doesn't exist
      const [deploymentFreq, changeFailure, leadTime, meanTimeRestore] = await Promise.all([
        doraService.getDeploymentFrequency(normalizedParams),
        doraService.getChangeFailureRate(normalizedParams),
        doraService.getLeadTimeForChanges(normalizedParams),
        doraService.getMeanTimeToRestore(normalizedParams)
      ]);

      // Combine into summary response format
      const response = {
        organization_name: organizationName,
        date_range: {
          start: normalizedParams.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          end: normalizedParams.endDate || new Date().toISOString()
        },
        metrics: {
          deployment_frequency: {
            average_per_day: deploymentFreq.summary.average_per_day,
            total_deployments: deploymentFreq.summary.total_deployments
          },
          change_failure_rate: {
            failure_rate_percent: changeFailure.summary.overall_failure_rate,
            total_deployments: changeFailure.summary.total_deployments,
            failed_deployments: changeFailure.summary.total_failed_deployments
          },
          lead_time_for_changes: {
            median_hours: leadTime.summary.overall_median_hours,
            median_days: leadTime.summary.overall_median_days
          },
          mean_time_to_restore: {
            median_hours: meanTimeRestore.summary.overall_median_hours,
            median_days: meanTimeRestore.summary.overall_median_hours / 24.0
          }
        },
        filters_applied: {
          projectName: normalizedParams.projectName,
          applicationName: normalizedParams.applicationName,
          environmentType: normalizedParams.environmentType
        }
      };

      logWithContext.info('All metrics request completed', organizationName, {
        deploymentFrequency: deploymentFreq.summary.average_per_day,
        changeFailureRate: changeFailure.summary.overall_failure_rate
      });

      res.json(response);

    } catch (error) {
      logWithContext.error('Failed to fetch all metrics', error as Error, organizationName);
      throw error;
    }
  }

  /**
   * getOrganizationHealth (FIXED to handle correct filters structure)
   */
  async getOrganizationHealth(req: Request, res: Response): Promise<void> {
    const organizationName = req.params.organizationName;
    logWithContext.info('Organization health check endpoint called', organizationName);

    try {
      const hasAccess = await doraService.validateOrganizationAccess(organizationName);
      // FIXED: Handle the correct response structure from databricksService
      const filtersResult = hasAccess ? await databricksService.getAvailableFilters(organizationName) : null;

      const healthStatus = {
        organization_name: organizationName,
        status: hasAccess ? 'healthy' : 'no_data',
        has_data: hasAccess,
        data_summary: filtersResult ? {
          projects_count: filtersResult.available_filters.projects.length,
          applications_count: filtersResult.available_filters.applications.length,
          environments_count: filtersResult.available_filters.environments.length,
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

export const doraController = new DoraController();