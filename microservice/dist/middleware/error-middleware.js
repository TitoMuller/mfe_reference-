"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleValidationError = exports.handleDatabaseError = exports.notFoundHandler = exports.asyncHandler = exports.errorHandler = exports.RateLimitError = exports.OrganizationAccessError = exports.ValidationError = exports.DatabaseError = exports.AppError = void 0;
const zod_1 = require("zod");
const logger_1 = require("@/utils/logger");
class AppError extends Error {
    statusCode;
    code;
    isOperational;
    constructor(message, statusCode = 500, code, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.isOperational = isOperational;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
class DatabaseError extends AppError {
    constructor(message, originalError) {
        super(`Database operation failed: ${message}`, 500, 'DATABASE_ERROR');
        if (originalError && originalError.stack) {
            this.stack = originalError.stack;
        }
    }
}
exports.DatabaseError = DatabaseError;
class ValidationError extends AppError {
    validationErrors;
    constructor(message, validationErrors) {
        super(message, 400, 'VALIDATION_ERROR');
        this.validationErrors = validationErrors;
    }
}
exports.ValidationError = ValidationError;
class OrganizationAccessError extends AppError {
    constructor(organizationName) {
        super(`Access denied to organization: ${organizationName}`, 403, 'ORGANIZATION_ACCESS_DENIED');
    }
}
exports.OrganizationAccessError = OrganizationAccessError;
class RateLimitError extends AppError {
    constructor() {
        super('Too many requests, please try again later', 429, 'RATE_LIMIT_EXCEEDED');
    }
}
exports.RateLimitError = RateLimitError;
const errorHandler = (error, req, res, next) => {
    let statusCode = 500;
    let message = 'Internal server error';
    let code = 'INTERNAL_ERROR';
    let details = undefined;
    if (error instanceof AppError) {
        statusCode = error.statusCode;
        message = error.message;
        code = error.code || 'APP_ERROR';
        if (error instanceof ValidationError && error.validationErrors) {
            details = error.validationErrors;
        }
    }
    else if (error instanceof zod_1.ZodError) {
        statusCode = 400;
        message = 'Validation failed';
        code = 'VALIDATION_ERROR';
        details = error.errors.map(err => ({
            path: err.path.join('.'),
            message: err.message,
            code: err.code,
        }));
    }
    else if (error.name === 'DBSQLError' || error.message.includes('Databricks')) {
        statusCode = 503;
        message = 'Database service temporarily unavailable';
        code = 'DATABASE_UNAVAILABLE';
        if (process.env['NODE_ENV'] !== 'production') {
            details = { originalError: error.message };
        }
    }
    else if (error.message.includes('timeout')) {
        statusCode = 504;
        message = 'Request timeout';
        code = 'TIMEOUT_ERROR';
    }
    else if (error.message.includes('ECONNREFUSED') || error.message.includes('ENOTFOUND')) {
        statusCode = 503;
        message = 'External service unavailable';
        code = 'SERVICE_UNAVAILABLE';
    }
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
        logger_1.logWithContext.error(`${statusCode} ${message}`, error, organizationName, errorLogData);
    }
    else if (statusCode >= 400) {
        logger_1.logWithContext.warn(`${statusCode} ${message}`, organizationName, {
            ...errorLogData,
            errorMessage: error.message,
        });
    }
    const errorResponse = {
        error: true,
        message,
        code,
        timestamp: new Date().toISOString(),
    };
    if (details && (process.env.NODE_ENV !== 'production' || statusCode === 400)) {
        errorResponse.details = details;
    }
    if (process.env['NODE_ENV'] !== 'production' && statusCode >= 500) {
        errorResponse.details = {
            ...errorResponse.details,
            stack: error.stack,
        };
    }
    res.status(statusCode).json(errorResponse);
};
exports.errorHandler = errorHandler;
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
exports.asyncHandler = asyncHandler;
const notFoundHandler = (req, res) => {
    res.status(404).json({
        error: true,
        message: `Route ${req.method} ${req.originalUrl} not found`,
        code: 'ROUTE_NOT_FOUND',
        timestamp: new Date().toISOString(),
    });
};
exports.notFoundHandler = notFoundHandler;
const handleDatabaseError = (error, operation) => {
    logger_1.logWithContext.error(`Database ${operation} failed`, error);
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
exports.handleDatabaseError = handleDatabaseError;
const handleValidationError = (zodError, field) => {
    const message = field ? `Validation failed for ${field}` : 'Validation failed';
    throw new ValidationError(message, zodError.errors);
};
exports.handleValidationError = handleValidationError;
//# sourceMappingURL=error-middleware.js.map