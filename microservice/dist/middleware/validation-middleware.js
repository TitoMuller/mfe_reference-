"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateDateRange = exports.convertTimeRangeTodates = exports.addDefaultTimeRange = exports.paginationQuerySchema = exports.filterQuerySchema = exports.dateRangeQuerySchema = exports.organizationParamSchema = void 0;
exports.validateRequest = validateRequest;
const zod_1 = require("zod");
const error_middleware_1 = require("./error-middleware");
function validateRequest(schemas) {
    return (req, res, next) => {
        try {
            if (schemas.body) {
                req.body = schemas.body.parse(req.body);
            }
            if (schemas.query) {
                req.query = schemas.query.parse(req.query);
            }
            if (schemas.params) {
                req.params = schemas.params.parse(req.params);
            }
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                throw new error_middleware_1.ValidationError('Request validation failed', error.errors);
            }
            throw error;
        }
    };
}
const zod_2 = require("zod");
exports.organizationParamSchema = zod_2.z.object({
    organizationName: zod_2.z.string()
        .min(3, 'Organization name must be at least 3 characters')
        .max(50, 'Organization name must not exceed 50 characters')
        .regex(/^[a-zA-Z0-9_-]+$/, 'Organization name can only contain letters, numbers, hyphens, and underscores'),
});
exports.dateRangeQuerySchema = zod_2.z.object({
    startDate: zod_2.z.string()
        .datetime('Invalid start date format. Use ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ)')
        .optional(),
    endDate: zod_2.z.string()
        .datetime('Invalid end date format. Use ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ)')
        .optional(),
    timeRange: zod_2.z.enum(['7d', '30d', '90d', '1y'], {
        errorMap: () => ({ message: 'Time range must be one of: 7d, 30d, 90d, 1y' })
    }).optional(),
}).refine((data) => {
    if (data.startDate && data.endDate && data.timeRange) {
        return true;
    }
    if (data.startDate && !data.endDate) {
        return false;
    }
    if (data.endDate && !data.startDate) {
        return false;
    }
    return true;
}, {
    message: 'When providing dates, both startDate and endDate must be specified',
});
exports.filterQuerySchema = zod_2.z.object({
    projectName: zod_2.z.string()
        .min(1, 'Project name cannot be empty')
        .max(100, 'Project name must not exceed 100 characters')
        .optional(),
    applicationName: zod_2.z.string()
        .min(1, 'Application name cannot be empty')
        .max(100, 'Application name must not exceed 100 characters')
        .optional(),
    environmentType: zod_2.z.enum(['production', 'staging', 'development'], {
        errorMap: () => ({ message: 'Environment type must be one of: production, staging, development' })
    }).optional(),
});
exports.paginationQuerySchema = zod_2.z.object({
    page: zod_2.z.string()
        .transform((val) => parseInt(val, 10))
        .refine((val) => val > 0, 'Page must be greater than 0')
        .default('1'),
    limit: zod_2.z.string()
        .transform((val) => parseInt(val, 10))
        .refine((val) => val > 0 && val <= 1000, 'Limit must be between 1 and 1000')
        .default('100'),
});
const addDefaultTimeRange = (req, res, next) => {
    if (!req.query.startDate && !req.query.endDate && !req.query.timeRange) {
        req.query.timeRange = '30d';
    }
    next();
};
exports.addDefaultTimeRange = addDefaultTimeRange;
const convertTimeRangeTodates = (req, res, next) => {
    if (req.query.timeRange && !req.query.startDate && !req.query.endDate) {
        const now = new Date();
        const endDate = now.toISOString();
        let startDate;
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
exports.convertTimeRangeTodates = convertTimeRangeTodates;
const validateDateRange = (req, res, next) => {
    const { startDate, endDate } = req.query;
    if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        if (start >= end) {
            throw new error_middleware_1.ValidationError('End date must be after start date');
        }
        const maxDays = 2 * 365;
        const daysDiff = (end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000);
        if (daysDiff > maxDays) {
            throw new error_middleware_1.ValidationError(`Date range cannot exceed ${maxDays} days`);
        }
    }
    next();
};
exports.validateDateRange = validateDateRange;
//# sourceMappingURL=validation-middleware.js.map