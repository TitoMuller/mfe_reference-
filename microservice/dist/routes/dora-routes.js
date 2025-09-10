"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.doraRoutes = void 0;
const express_1 = require("express");
const dora_controller_1 = require("@/controllers/dora-controller");
const validation_middleware_1 = require("@/middleware/validation-middleware");
const error_middleware_1 = require("@/middleware/error-middleware");
const dora_models_1 = require("@/models/dora-models");
const router = (0, express_1.Router)();
exports.doraRoutes = router;
const commonQuerySchema = dora_models_1.baseQuerySchema.extend({
    ...validation_middleware_1.dateRangeQuerySchema.shape,
    ...validation_middleware_1.filterQuerySchema.shape,
});
router.get('/:organizationName/deployment-frequency', (0, validation_middleware_1.validateRequest)({
    params: validation_middleware_1.organizationParamSchema,
    query: dora_models_1.deploymentFrequencyQuerySchema,
}), validation_middleware_1.addDefaultTimeRange, validation_middleware_1.convertTimeRangeTodates, validation_middleware_1.validateDateRange, (0, error_middleware_1.asyncHandler)(dora_controller_1.doraController.getDeploymentFrequency.bind(dora_controller_1.doraController)));
router.get('/:organizationName/change-failure-rate', (0, validation_middleware_1.validateRequest)({
    params: validation_middleware_1.organizationParamSchema,
    query: dora_models_1.changeFailureRateQuerySchema,
}), validation_middleware_1.addDefaultTimeRange, validation_middleware_1.convertTimeRangeTodates, validation_middleware_1.validateDateRange, (0, error_middleware_1.asyncHandler)(dora_controller_1.doraController.getChangeFailureRate.bind(dora_controller_1.doraController)));
router.get('/:organizationName/lead-time-for-changes', (0, validation_middleware_1.validateRequest)({
    params: validation_middleware_1.organizationParamSchema,
    query: dora_models_1.leadTimeQuerySchema,
}), validation_middleware_1.addDefaultTimeRange, validation_middleware_1.convertTimeRangeTodates, validation_middleware_1.validateDateRange, (0, error_middleware_1.asyncHandler)(dora_controller_1.doraController.getLeadTimeForChanges.bind(dora_controller_1.doraController)));
router.get('/:organizationName/mean-time-to-restore', (0, validation_middleware_1.validateRequest)({
    params: validation_middleware_1.organizationParamSchema,
    query: dora_models_1.meanTimeToRestoreQuerySchema,
}), validation_middleware_1.addDefaultTimeRange, validation_middleware_1.convertTimeRangeTodates, validation_middleware_1.validateDateRange, (0, error_middleware_1.asyncHandler)(dora_controller_1.doraController.getMeanTimeToRestore.bind(dora_controller_1.doraController)));
router.get('/:organizationName/summary', (0, validation_middleware_1.validateRequest)({
    params: validation_middleware_1.organizationParamSchema,
    query: commonQuerySchema,
}), validation_middleware_1.addDefaultTimeRange, validation_middleware_1.convertTimeRangeTodates, validation_middleware_1.validateDateRange, (0, error_middleware_1.asyncHandler)(dora_controller_1.doraController.getAllMetrics.bind(dora_controller_1.doraController)));
router.get('/:organizationName/filters', (0, validation_middleware_1.validateRequest)({
    params: validation_middleware_1.organizationParamSchema,
}), (0, error_middleware_1.asyncHandler)(dora_controller_1.doraController.getAvailableFilters.bind(dora_controller_1.doraController)));
router.get('/:organizationName/health', (0, validation_middleware_1.validateRequest)({
    params: validation_middleware_1.organizationParamSchema,
}), (0, error_middleware_1.asyncHandler)(dora_controller_1.doraController.getOrganizationHealth.bind(dora_controller_1.doraController)));
//# sourceMappingURL=dora-routes.js.map