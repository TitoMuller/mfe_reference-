"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.doraController = exports.DoraController = void 0;
const dora_service_1 = require("@/services/dora-service");
const logger_1 = require("@/utils/logger");
const error_middleware_1 = require("@/middleware/error-middleware");
class DoraController {
    async getDeploymentFrequency(req, res) {
        const organizationName = req.organizationName;
        const queryParams = req.query;
        logger_1.logWithContext.info('Deployment frequency endpoint called', organizationName, { queryParams });
        const hasAccess = await dora_service_1.doraService.validateOrganizationAccess(organizationName);
        if (!hasAccess) {
            throw new error_middleware_1.OrganizationAccessError(organizationName);
        }
        const result = await dora_service_1.doraService.getDeploymentFrequency({
            ...queryParams,
            organizationName,
        });
        logger_1.logWithContext.info('Deployment frequency request completed', organizationName, {
            recordCount: result.data.length,
            totalDeployments: result.summary.total_deployments,
        });
        res.json(result);
    }
    async getChangeFailureRate(req, res) {
        const organizationName = req.organizationName;
        const queryParams = req.query;
        logger_1.logWithContext.info('Change failure rate endpoint called', organizationName, { queryParams });
        const hasAccess = await dora_service_1.doraService.validateOrganizationAccess(organizationName);
        if (!hasAccess) {
            throw new error_middleware_1.OrganizationAccessError(organizationName);
        }
        const result = await dora_service_1.doraService.getChangeFailureRate({
            ...queryParams,
            organizationName,
        });
        logger_1.logWithContext.info('Change failure rate request completed', organizationName, {
            recordCount: result.data.length,
            overallFailureRate: result.summary.overall_failure_rate,
        });
        res.json(result);
    }
    async getLeadTimeForChanges(req, res) {
        const organizationName = req.organizationName;
        const queryParams = req.query;
        logger_1.logWithContext.info('Lead time for changes endpoint called', organizationName, { queryParams });
        const hasAccess = await dora_service_1.doraService.validateOrganizationAccess(organizationName);
        if (!hasAccess) {
            throw new error_middleware_1.OrganizationAccessError(organizationName);
        }
        const result = await dora_service_1.doraService.getLeadTimeForChanges({
            ...queryParams,
            organizationName,
        });
        logger_1.logWithContext.info('Lead time for changes request completed', organizationName, {
            recordCount: result.data.length,
            medianHours: result.summary.overall_median_hours,
        });
        res.json(result);
    }
    async getMeanTimeToRestore(req, res) {
        const organizationName = req.organizationName;
        const queryParams = req.query;
        logger_1.logWithContext.info('Mean time to restore endpoint called', organizationName, { queryParams });
        const hasAccess = await dora_service_1.doraService.validateOrganizationAccess(organizationName);
        if (!hasAccess) {
            throw new error_middleware_1.OrganizationAccessError(organizationName);
        }
        const result = await dora_service_1.doraService.getMeanTimeToRestore({
            ...queryParams,
            organizationName,
        });
        logger_1.logWithContext.info('Mean time to restore request completed', organizationName, {
            recordCount: result.data.length,
            medianHours: result.summary.overall_median_hours,
        });
        res.json(result);
    }
    async getAllMetrics(req, res) {
        const organizationName = req.organizationName;
        const queryParams = req.query;
        logger_1.logWithContext.info('All DORA metrics endpoint called', organizationName, { queryParams });
        const hasAccess = await dora_service_1.doraService.validateOrganizationAccess(organizationName);
        if (!hasAccess) {
            throw new error_middleware_1.OrganizationAccessError(organizationName);
        }
        const result = await dora_service_1.doraService.getAllDoraMetrics({
            ...queryParams,
            organizationName,
        });
        logger_1.logWithContext.info('All DORA metrics request completed', organizationName, {
            deploymentFrequency: result.metrics.deployment_frequency.average_per_day,
            changeFailureRate: result.metrics.change_failure_rate.failure_rate_percent,
        });
        res.json(result);
    }
    async getAvailableFilters(req, res) {
        const organizationName = req.organizationName;
        logger_1.logWithContext.info('Available filters endpoint called', organizationName);
        const hasAccess = await dora_service_1.doraService.validateOrganizationAccess(organizationName);
        if (!hasAccess) {
            throw new error_middleware_1.OrganizationAccessError(organizationName);
        }
        const filters = await dora_service_1.doraService.getAvailableFilters(organizationName);
        logger_1.logWithContext.info('Available filters request completed', organizationName, {
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
    async getOrganizationHealth(req, res) {
        const organizationName = req.organizationName;
        logger_1.logWithContext.info('Organization health check endpoint called', organizationName);
        try {
            const hasAccess = await dora_service_1.doraService.validateOrganizationAccess(organizationName);
            const filters = hasAccess ? await dora_service_1.doraService.getAvailableFilters(organizationName) : null;
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
            logger_1.logWithContext.info('Organization health check completed', organizationName, {
                status: healthStatus.status,
                hasData: hasAccess,
            });
            res.status(hasAccess ? 200 : 404).json(healthStatus);
        }
        catch (error) {
            logger_1.logWithContext.error('Organization health check failed', error, organizationName);
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
exports.DoraController = DoraController;
exports.doraController = new DoraController();
//# sourceMappingURL=dora-controller.js.map