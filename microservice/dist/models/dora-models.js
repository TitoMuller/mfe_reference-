"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.meanTimeToRestoreQuerySchema = exports.leadTimeQuerySchema = exports.changeFailureRateQuerySchema = exports.deploymentFrequencyQuerySchema = exports.baseQuerySchema = void 0;
const zod_1 = require("zod");
exports.baseQuerySchema = zod_1.z.object({
    organizationName: zod_1.z.string().min(1, 'Organization name is required'),
    startDate: zod_1.z.string().datetime().optional(),
    endDate: zod_1.z.string().datetime().optional(),
    projectName: zod_1.z.string().optional(),
    applicationName: zod_1.z.string().optional(),
    environmentType: zod_1.z.enum(['production', 'staging', 'development']).optional(),
    timeRange: zod_1.z.enum(['7d', '30d', '90d', '1y']).optional(),
});
exports.deploymentFrequencyQuerySchema = exports.baseQuerySchema.extend({
    aggregation: zod_1.z.enum(['daily', 'weekly', 'monthly']).default('daily'),
});
exports.changeFailureRateQuerySchema = exports.baseQuerySchema.extend({
    includeDetails: zod_1.z.boolean().default(false),
});
exports.leadTimeQuerySchema = exports.baseQuerySchema.extend({
    percentile: zod_1.z.number().min(0).max(100).default(50),
});
exports.meanTimeToRestoreQuerySchema = exports.baseQuerySchema.extend({
    includeOutliers: zod_1.z.boolean().default(false),
});
//# sourceMappingURL=dora-models.js.map