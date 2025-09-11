import { Router } from 'express';
import { doraController } from '@/controllers/dora-controller';
import { validateRequest, 
  organizationParamSchema, 
  dateRangeQuerySchema, 
  filterQuerySchema, 
  addDefaultTimeRange, 
  convertTimeRangeTodates, 
  validateDateRange 
} from '@/middleware/validation-middleware';
import { asyncHandler } from '@/middleware/error-middleware';
import { 
  deploymentFrequencyQuerySchema,
  changeFailureRateQuerySchema,
  leadTimeQuerySchema,
  meanTimeToRestoreQuerySchema,
  baseQuerySchema
} from '@/models/dora-models';
import { z } from 'zod';

const router = Router();

/**
 * Combined query schema for most endpoints
 */
const commonQuerySchema = baseQuerySchema.extend({
  // dateRangeQuerySchema is a ZodEffects wrapper; cast to any to access inner .shape safely
  ...(dateRangeQuerySchema as any).shape,
  ...filterQuerySchema.shape,
});

/**
 * @route   GET /api/v1/dora/:organizationName/deployment-frequency
 * @desc    Get deployment frequency metrics for an organization
 * @access  Private (requires authentication)
 * @example GET /api/v1/dora/my-org/deployment-frequency?startDate=2024-01-01T00:00:00.000Z&endDate=2024-01-31T23:59:59.999Z&environmentType=production
 */
router.get(
  '/:organizationName/deployment-frequency',
  validateRequest({
    params: organizationParamSchema,
    query: deploymentFrequencyQuerySchema,
  }),
  addDefaultTimeRange,
  convertTimeRangeTodates,
  validateDateRange,
  asyncHandler(doraController.getDeploymentFrequency.bind(doraController))
);

/**
 * @route   GET /api/v1/dora/:organizationName/change-failure-rate
 * @desc    Get change failure rate metrics for an organization
 * @access  Private (requires authentication)
 * @example GET /api/v1/dora/my-org/change-failure-rate?timeRange=30d&projectName=web-app
 */
router.get(
  '/:organizationName/change-failure-rate',
  validateRequest({
    params: organizationParamSchema,
    query: changeFailureRateQuerySchema,
  }),
  addDefaultTimeRange,
  convertTimeRangeTodates,
  validateDateRange,
  asyncHandler(doraController.getChangeFailureRate.bind(doraController))
);

/**
 * @route   GET /api/v1/dora/:organizationName/lead-time-for-changes
 * @desc    Get lead time for changes metrics for an organization
 * @access  Private (requires authentication)
 * @example GET /api/v1/dora/my-org/lead-time-for-changes?timeRange=90d&environmentType=production
 */
router.get(
  '/:organizationName/lead-time-for-changes',
  validateRequest({
    params: organizationParamSchema,
    query: leadTimeQuerySchema,
  }),
  addDefaultTimeRange,
  convertTimeRangeTodates,
  validateDateRange,
  asyncHandler(doraController.getLeadTimeForChanges.bind(doraController))
);

/**
 * @route   GET /api/v1/dora/:organizationName/mean-time-to-restore
 * @desc    Get mean time to restore metrics for an organization
 * @access  Private (requires authentication)
 * @example GET /api/v1/dora/my-org/mean-time-to-restore?timeRange=1y&applicationName=api-service
 */
router.get(
  '/:organizationName/mean-time-to-restore',
  validateRequest({
    params: organizationParamSchema,
    query: meanTimeToRestoreQuerySchema,
  }),
  addDefaultTimeRange,
  convertTimeRangeTodates,
  validateDateRange,
  asyncHandler(doraController.getMeanTimeToRestore.bind(doraController))
);

/**
 * @route   GET /api/v1/dora/:organizationName/summary
 * @desc    Get summary of all DORA metrics for an organization
 * @access  Private (requires authentication)
 * @example GET /api/v1/dora/my-org/summary?timeRange=30d
 */
router.get(
  '/:organizationName/summary',
  validateRequest({
    params: organizationParamSchema,
    query: commonQuerySchema,
  }),
  addDefaultTimeRange,
  convertTimeRangeTodates,
  validateDateRange,
  asyncHandler(doraController.getAllMetrics.bind(doraController))
);

/**
 * @route   GET /api/v1/dora/:organizationName/filters
 * @desc    Get available filter options for an organization (projects, applications, environments)
 * @access  Private (requires authentication)
 * @example GET /api/v1/dora/my-org/filters
 */
router.get(
  '/:organizationName/filters',
  validateRequest({
    params: organizationParamSchema,
  }),
  asyncHandler(doraController.getAvailableFilters.bind(doraController))
);

/**
 * @route   GET /api/v1/dora/:organizationName/health
 * @desc    Health check for organization-specific data availability
 * @access  Private (requires authentication)
 * @example GET /api/v1/dora/my-org/health
 */
router.get(
  '/:organizationName/health',
  validateRequest({
    params: organizationParamSchema,
  }),
  asyncHandler(doraController.getOrganizationHealth.bind(doraController))
);

// Export the router
export { router as doraRoutes };

/**
 * API Documentation (OpenAPI/Swagger style comments for reference)
 * 
 * Common Query Parameters:
 * - startDate: ISO 8601 datetime string (e.g., "2024-01-01T00:00:00.000Z")
 * - endDate: ISO 8601 datetime string (e.g., "2024-01-31T23:59:59.999Z") 
 * - timeRange: Quick date range selector ("7d", "30d", "90d", "1y")
 * - projectName: Filter by specific project name
 * - applicationName: Filter by specific application name
 * - environmentType: Filter by environment ("production", "staging", "development")
 * 
 * Common Response Format:
 * {
 *   "metric": "deployment_frequency",
 *   "data": [...],
 *   "summary": {
 *     "total_deployments": 150,
 *     "average_per_day": 5.2,
 *     "date_range": {
 *       "start": "2024-01-01T00:00:00.000Z",
 *       "end": "2024-01-31T23:59:59.999Z"
 *     },
 *     "filters_applied": {
 *       "environmentType": "production"
 *     }
 *   }
 * }
 * 
 * Error Response Format:
 * {
 *   "error": true,
 *   "message": "Organization not found or no data available",
 *   "code": "ORGANIZATION_ACCESS_DENIED",
 *   "timestamp": "2024-01-15T10:30:00.000Z"
 * }
 */