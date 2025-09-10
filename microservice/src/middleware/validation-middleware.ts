import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ValidationError } from './error-middleware';

/**
 * Request validation middleware factory
 * Creates middleware to validate request data against Zod schemas
 */
export function validateRequest(schemas: {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Validate request body
      if (schemas.body) {
        req.body = schemas.body.parse(req.body);
      }

      // Validate query parameters
      // If both params and query schemas are provided, merge URL params into query
      // so that required values provided via the path (e.g. organizationName) satisfy query validation.
      if (schemas.params && schemas.query && req.params) {
        // Only copy params that are not already present in query
        Object.keys(req.params).forEach((key) => {
          if ((req.params as any)[key] !== undefined && (req.query as any)[key] === undefined) {
            // ensure string type for query parsing
            (req.query as any)[key] = String((req.params as any)[key]);
          }
        });
      }

      if (schemas.query) {
        req.query = schemas.query.parse(req.query);
      }

      // Validate URL parameters
      if (schemas.params) {
        req.params = schemas.params.parse(req.params);
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        throw new ValidationError('Request validation failed', error.errors);
      }
      throw error;
    }
  };
}

/**
 * Organization name parameter validation
 * Ensures organization name is present and valid in URL params
 */
import { z } from 'zod';

export const organizationParamSchema = z.object({
  organizationName: z.string()
    .min(3, 'Organization name must be at least 3 characters')
    .max(50, 'Organization name must not exceed 50 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Organization name can only contain letters, numbers, hyphens, and underscores'),
});

/**
 * Common query parameter schemas
 */
export const dateRangeQuerySchema = z.object({
  startDate: z.string()
    .datetime('Invalid start date format. Use ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ)')
    .optional(),
  endDate: z.string()
    .datetime('Invalid end date format. Use ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ)')
    .optional(),
  timeRange: z.enum(['7d', '30d', '90d', '1y'], {
    errorMap: () => ({ message: 'Time range must be one of: 7d, 30d, 90d, 1y' })
  }).optional(),
}).refine((data) => {
  // If both startDate/endDate and timeRange are provided, prefer explicit dates
  if (data.startDate && data.endDate && data.timeRange) {
    return true; // Allow both, but timeRange will be ignored
  }
  
  // If startDate is provided, endDate should also be provided
  if (data.startDate && !data.endDate) {
    return false;
  }
  
  // If endDate is provided, startDate should also be provided
  if (data.endDate && !data.startDate) {
    return false;
  }
  
  return true;
}, {
  message: 'When providing dates, both startDate and endDate must be specified',
});

export const filterQuerySchema = z.object({
  projectName: z.string()
    .min(1, 'Project name cannot be empty')
    .max(100, 'Project name must not exceed 100 characters')
    .optional(),
  applicationName: z.string()
    .min(1, 'Application name cannot be empty')
    .max(100, 'Application name must not exceed 100 characters')
    .optional(),
  environmentType: z.enum(['production', 'staging', 'development'], {
    errorMap: () => ({ message: 'Environment type must be one of: production, staging, development' })
  }).optional(),
});

/**
 * Pagination query schema
 */
export const paginationQuerySchema = z.object({
  page: z.string()
    .transform((val) => parseInt(val, 10))
    .refine((val) => val > 0, 'Page must be greater than 0')
    .default('1'),
  limit: z.string()
    .transform((val) => parseInt(val, 10))
    .refine((val) => val > 0 && val <= 1000, 'Limit must be between 1 and 1000')
    .default('100'),
});

/**
 * Middleware to add default time range if none specified
 */
export const addDefaultTimeRange = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.query.startDate && !req.query.endDate && !req.query.timeRange) {
    // Default to last 30 days
    req.query.timeRange = '30d';
  }
  next();
};

/**
 * Middleware to convert time range to explicit dates
 */
export const convertTimeRangeTodates = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (req.query.timeRange && !req.query.startDate && !req.query.endDate) {
    const now = new Date();
    const endDate = now.toISOString();
    let startDate: string;

    switch (req.query.timeRange) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString();
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000).toISOString();
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
    }

    req.query.startDate = startDate;
    req.query.endDate = endDate;
  }
  
  next();
};

/**
 * Validate that end date is after start date
 */
export const validateDateRange = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { startDate, endDate } = req.query;
  
  if (startDate && endDate) {
    const start = new Date(startDate as string);
    const end = new Date(endDate as string);
    
    if (start >= end) {
      throw new ValidationError('End date must be after start date');
    }
    
    // Check if date range is not too large (e.g., max 2 years)
    const maxDays = 2 * 365; // 2 years
    const daysDiff = (end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000);
    
    if (daysDiff > maxDays) {
      throw new ValidationError(`Date range cannot exceed ${maxDays} days`);
    }
  }
  
  next();
};