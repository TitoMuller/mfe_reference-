import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { logWithContext } from '@/utils/logger';
import { AuthenticatedRequest } from './auth-middleware';
import { ApiErrorResponse } from '@/models/dora-models';

/**
 * Custom error class for application-specific errors
 */
export class AppError extends Error {
  public statusCode: number;
  public code?: string | undefined;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500, code?: string, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;

    // Maintain proper stack trace
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Database-specific error class
 */
export class DatabaseError extends AppError {
  constructor(message: string, originalError?: Error) {
    super(`Database operation failed: ${message}`, 500, 'DATABASE_ERROR');

    // Only copy stack when it's defined to satisfy strict exactOptionalPropertyTypes
    if (originalError && originalError.stack) {
      this.stack = originalError.stack;
    }
  }
}

/**
 * Validation error class
 */
export class ValidationError extends AppError {
  public validationErrors: any;

  constructor(message: string, validationErrors?: any) {
    super(message, 400, 'VALIDATION_ERROR');
    this.validationErrors = validationErrors;
  }
}

/**
 * Organization access error
 */
export class OrganizationAccessError extends AppError {
  constructor(organizationName: string) {
    super(`Access denied to organization: ${organizationName}`, 403, 'ORGANIZATION_ACCESS_DENIED');
  }
}

/**
 * Rate limit error
 */
export class RateLimitError extends AppError {
  constructor() {
    super('Too many requests, please try again later', 429, 'RATE_LIMIT_EXCEEDED');
  }
}

/**
 * Global error handler middleware
 * Handles all errors thrown in the application and returns consistent error responses
 */
export const errorHandler = (
  error: Error,
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  let statusCode = 500;
  let message = 'Internal server error';
  let code = 'INTERNAL_ERROR';
  let details: any = undefined;

  // Handle different error types
  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
    code = error.code || 'APP_ERROR';
    
    if (error instanceof ValidationError && error.validationErrors) {
      details = error.validationErrors;
    }
  } else if (error instanceof ZodError) {
    // Handle Zod validation errors
    statusCode = 400;
    message = 'Validation failed';
    code = 'VALIDATION_ERROR';
    details = error.errors.map(err => ({
      path: err.path.join('.'),
      message: err.message,
      code: err.code,
    }));
  } else if (error.name === 'DBSQLError' || error.message.includes('Databricks')) {
    // Handle Databricks-specific errors
    statusCode = 503;
    message = 'Database service temporarily unavailable';
    code = 'DATABASE_UNAVAILABLE';
    
    // Don't expose internal database errors to clients in production
    if (process.env['NODE_ENV'] !== 'production') {
      details = { originalError: error.message };
    }
  } else if (error.message.includes('timeout')) {
    // Handle timeout errors
    statusCode = 504;
    message = 'Request timeout';
    code = 'TIMEOUT_ERROR';
  } else if (error.message.includes('ECONNREFUSED') || error.message.includes('ENOTFOUND')) {
    // Handle connection errors
    statusCode = 503;
    message = 'External service unavailable';
    code = 'SERVICE_UNAVAILABLE';
  }

  // Log the error with context
  const organizationName = req.organizationName;
  const errorLogData = {
    url: req.url,
    method: req.method,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
    userId: req.user?.id,
    statusCode,
    code,
  };

  if (statusCode >= 500) {
    // Log server errors as errors
    logWithContext.error(`${statusCode} ${message}`, error, organizationName, errorLogData);
  } else if (statusCode >= 400) {
    // Log client errors as warnings
    logWithContext.warn(`${statusCode} ${message}`, organizationName, {
      ...errorLogData,
      errorMessage: error.message,
    });
  }

  // Prepare error response
  const errorResponse: ApiErrorResponse = {
    error: true,
    message,
    code,
    timestamp: new Date().toISOString(),
  };

  // Add details only in non-production environments or for validation errors
  if (details && (process.env.NODE_ENV !== 'production' || statusCode === 400)) {
    errorResponse.details = details;
  }

  // Don't expose stack traces in production
  if (process.env['NODE_ENV'] !== 'production' && statusCode >= 500) {
    errorResponse.details = {
      ...errorResponse.details,
      stack: error.stack,
    };
  }

  res.status(statusCode).json(errorResponse);
};

/**
 * Async error handler wrapper
 * Wraps async route handlers to automatically catch and pass errors to error middleware
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * 404 Not Found handler
 */
export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    error: true,
    message: `Route ${req.method} ${req.originalUrl} not found`,
    code: 'ROUTE_NOT_FOUND',
    timestamp: new Date().toISOString(),
  });
};

/**
 * Database error handler utility
 * Converts database errors to appropriate HTTP errors
 */
export const handleDatabaseError = (error: Error, operation: string): never => {
  logWithContext.error(`Database ${operation} failed`, error);

  if (error.message.includes('timeout')) {
    throw new DatabaseError(`${operation} timed out`);
  }
  
  if (error.message.includes('connection')) {
    throw new DatabaseError(`Unable to connect to database for ${operation}`);
  }
  
  if (error.message.includes('permission') || error.message.includes('access')) {
    throw new DatabaseError(`Access denied for ${operation}`);
  }

  throw new DatabaseError(`${operation} failed: ${error.message}`, error);
};

/**
 * Validation error handler utility
 */
export const handleValidationError = (zodError: ZodError, field?: string): never => {
  const message = field ? `Validation failed for ${field}` : 'Validation failed';
  throw new ValidationError(message, zodError.errors);
};