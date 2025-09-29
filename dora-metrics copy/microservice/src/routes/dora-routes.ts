import { Router } from 'express';
import { z } from 'zod';
import { validateRequest, organizationParamSchema, addDefaultTimeRange, convertTimeRangeTodates, validateDateRange } from '@/middleware/validation-middleware';
import { asyncHandler } from '@/middleware/error-middleware';
import { validateOrganizationDataAccess } from '@/middleware/auth-middleware';
import { doraController } from '@/controllers/dora-controller';

const router = Router();

/**
 * Common Query Schema (FIXED to support multi-select arrays)
 * 
 * Key fixes:
 * 1. All filter fields now accept both single values and arrays
 * 2. Environment filter validates against exact database values
 * 3. Proper transformation of single values to arrays
 * 4. Maintains backward compatibility with existing single-value calls
 */
const commonQuerySchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  timeRange: z.enum(['7d', '30d', '90d', '1y']).optional(),
  
  // Multi-select project names (accepts both string and array)
  projectName: z.union([
    z.string(),
    z.array(z.string())
  ]).optional().transform(val => {
    if (typeof val === 'string') return [val];
    return val;
  }),
  
  // Multi-select application names (accepts both string and array)
  applicationName: z.union([
    z.string(),
    z.array(z.string())
  ]).optional().transform(val => {
    if (typeof val === 'string') return [val];
    return val;
  }),
  
  // Multi-select environment types (accepts both string and array)
  // Only allows the exact values from the database
  environmentType: z.union([
    z.enum(['Production', 'Non-Production']),
    z.array(z.enum(['Production', 'Non-Production']))
  ]).optional().transform(val => {
    if (typeof val === 'string') return [val];
    return val;
  })
});

/**
 * Filters Query Schema (FIXED for cascading behavior)
 * Used for the /filters endpoint to support cascading
 */
const filtersQuerySchema = z.object({
  // When requesting applications, optionally filter by projects
  projectName: z.union([
    z.string(),
    z.array(z.string())
  ]).optional().transform(val => {
    if (typeof val === 'string') return [val];
    return val;
  })
});

/**
 * @route   GET /api/v1/dora/:organizationName/deployment-frequency
 * @desc    Get deployment frequency metrics (FIXED for multi-select)
 * @access  Private (requires authentication)
 * @example GET /api/v1/dora/my-org/deployment-frequency?projectName=proj1&projectName=proj2
 */
router.get(
  '/:organizationName/deployment-frequency',
  validateOrganizationDataAccess,
  validateRequest({
    params: organizationParamSchema,
    query: commonQuerySchema,
  }),
  addDefaultTimeRange,
  convertTimeRangeTodates,
  validateDateRange,
  asyncHandler(doraController.getDeploymentFrequency.bind(doraController))
);

/**
 * @route   GET /api/v1/dora/:organizationName/change-failure-rate
 * @desc    Get change failure rate metrics (FIXED for multi-select)
 * @access  Private (requires authentication)
 * @example GET /api/v1/dora/my-org/change-failure-rate?applicationName=app1&applicationName=app2
 */
router.get(
  '/:organizationName/change-failure-rate',
  validateOrganizationDataAccess,
  validateRequest({
    params: organizationParamSchema,
    query: commonQuerySchema,
  }),
  addDefaultTimeRange,
  convertTimeRangeTodates,
  validateDateRange,
  asyncHandler(doraController.getChangeFailureRate.bind(doraController))
);

/**
 * @route   GET /api/v1/dora/:organizationName/lead-time-for-changes
 * @desc    Get lead time for changes metrics (FIXED for multi-select)
 * @access  Private (requires authentication)
 * @example GET /api/v1/dora/my-org/lead-time-for-changes?environmentType=Production&environmentType=Non-Production
 */
router.get(
  '/:organizationName/lead-time-for-changes',
  validateOrganizationDataAccess,
  validateRequest({
    params: organizationParamSchema,
    query: commonQuerySchema,
  }),
  addDefaultTimeRange,
  convertTimeRangeTodates,
  validateDateRange,
  asyncHandler(doraController.getLeadTimeForChanges.bind(doraController))
);

/**
 * @route   GET /api/v1/dora/:organizationName/mean-time-to-restore
 * @desc    Get mean time to restore metrics (FIXED for multi-select)
 * @access  Private (requires authentication)
 * @example GET /api/v1/dora/my-org/mean-time-to-restore?projectName=critical-proj
 */
router.get(
  '/:organizationName/mean-time-to-restore',
  validateOrganizationDataAccess,
  validateRequest({
    params: organizationParamSchema,
    query: commonQuerySchema,
  }),
  addDefaultTimeRange,
  convertTimeRangeTodates,
  validateDateRange,
  asyncHandler(doraController.getMeanTimeToRestore.bind(doraController))
);

/**
 * @route   GET /api/v1/dora/:organizationName/summary
 * @desc    Get all DORA metrics in a single request (FIXED for multi-select)
 * @access  Private (requires authentication)
 * @example GET /api/v1/dora/my-org/summary?projectName=proj1&applicationName=app1&environmentType=Production
 */
router.get(
  '/:organizationName/summary',
  validateOrganizationDataAccess,
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
 * @desc    Get available filter options (FIXED for cascading support)
 * @access  Private (requires authentication)
 * @example GET /api/v1/dora/my-org/filters - Get all filters
 * @example GET /api/v1/dora/my-org/filters?projectName=proj1 - Get applications for proj1
 */
router.get(
  '/:organizationName/filters',
  validateOrganizationDataAccess,
  validateRequest({
    params: organizationParamSchema,
    query: filtersQuerySchema,
  }),
  asyncHandler(doraController.getAvailableFilters.bind(doraController))
);

/**
 * @route   GET /api/v1/dora/:organizationName/health
 * @desc    Health check for organization-specific data availability (unchanged)
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

// Export the router (keeping existing name)
export { router as doraRoutes };

/**
 * FIXED API Documentation
 * 
 * Multi-Select Query Parameters:
 * All filter parameters now support both single values and arrays:
 * 
 * Single Value (backward compatible):
 * - ?projectName=my-project
 * - ?applicationName=my-app
 * - ?environmentType=Production
 * 
 * Multi-Select (new functionality):
 * - ?projectName=proj1&projectName=proj2
 * - ?applicationName=app1&applicationName=app2  
 * - ?environmentType=Production&environmentType=Non-Production
 * 
 * JavaScript/TypeScript usage:
 * ```typescript
 * // Single value
 * const params = { projectName: 'my-project' };
 * 
 * // Multi-select
 * const params = { projectName: ['proj1', 'proj2'] };
 * 
 * // The buildQueryString function handles both formats
 * ```
 * 
 * Cascading Filter Behavior:
 * 1. Get all filters: GET /filters
 * 2. Select projects, then get filtered applications: 
 *    GET /filters?projectName=proj1&projectName=proj2
 *    - Returns applications that belong to those projects only
 * 
 * Environment Filter Logic:
 * - Empty array or no environmentType parameter = include all environments
 * - Single value: ?environmentType=Production = filter to Production only
 * - Both values: ?environmentType=Production&environmentType=Non-Production = include both
 * - Values must be exactly "Production" or "Non-Production" (case-sensitive)
 * 
 * FIXED Response Format:
 * ```json
 * {
 *   "metric": "deployment_frequency",
 *   "data": [
 *     {
 *       "date": "2025-07-03",
 *       "organization_name": "my-org",
 *       "deployment_count": 15
 *     }
 *   ],
 *   "summary": {
 *     "organization_name": "my-org",
 *     "total_deployments": 450,
 *     "average_per_day": 15.0,
 *     "date_range": {
 *       "start": "2025-06-03T00:00:00.000Z",
 *       "end": "2025-07-03T00:00:00.000Z"
 *     },
 *     "filters_applied": {
 *       "projectName": ["proj1", "proj2"],
 *       "applicationName": ["app1"],
 *       "environmentType": ["Production"]
 *     }
 *   }
 * }
 * ```
 * 
 * Error Handling:
 * - Invalid environment values return 400 Bad Request
 * - Unknown projects/applications are silently filtered out (no errors)
 * - Empty result sets return valid responses with empty data arrays
 * - Database connection errors return 503 Service Unavailable
 * 
 * Backward Compatibility:
 * - All existing single-value API calls continue to work unchanged
 * - Response format remains the same
 * - New multi-select functionality is additive, not breaking
 */