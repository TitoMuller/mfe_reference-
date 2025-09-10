"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.doraService = exports.DoraService = void 0;
const databricks_service_1 = require("./databricks-service");
const logger_1 = require("@/utils/logger");
class DoraService {
    async getDeploymentFrequency(params) {
        const { organizationName, aggregation = 'daily', ...queryParams } = params;
        logger_1.logWithContext.info('Processing deployment frequency request', organizationName, { params });
        const rawData = await databricks_service_1.databricksService.getDeploymentFrequency({
            organizationName,
            ...queryParams,
            aggregation,
        });
        const aggregatedData = this.aggregateDeploymentData(rawData, aggregation);
        const totalDeployments = rawData.reduce((sum, row) => sum + row.deployment_count, 0);
        const uniqueDays = new Set(rawData.map(row => row.deployment_date)).size;
        const averagePerDay = uniqueDays > 0 ? totalDeployments / uniqueDays : 0;
        const dateRange = this.calculateDateRange(rawData.map(r => r.deployment_date), queryParams.startDate, queryParams.endDate);
        const response = {
            metric: 'deployment_frequency',
            data: aggregatedData.map(row => ({
                date: row.deployment_date,
                organization_name: row.organization_name,
                project_name: row.project_name,
                application_name: row.application_name,
                environment_type: row.environment_type,
                deployment_count: row.deployment_count,
                daily_average: aggregation === 'daily' ? row.deployment_count : undefined,
            })),
            summary: {
                total_deployments: totalDeployments,
                average_per_day: Math.round(averagePerDay * 100) / 100,
                date_range: dateRange,
                filters_applied: this.extractFilters(queryParams),
            },
        };
        logger_1.logWithContext.info('Successfully processed deployment frequency request', organizationName, {
            recordCount: response.data.length,
            totalDeployments,
            averagePerDay: response.summary.average_per_day,
        });
        return response;
    }
    async getChangeFailureRate(params) {
        const { organizationName, ...queryParams } = params;
        logger_1.logWithContext.info('Processing change failure rate request', organizationName, { params });
        const rawData = await databricks_service_1.databricksService.getChangeFailureRate({
            organizationName,
            ...queryParams,
        });
        const totalDeployments = rawData.reduce((sum, row) => sum + row.total_deployments, 0);
        const totalFailedDeployments = rawData.reduce((sum, row) => sum + row.failed_deployments, 0);
        const overallFailureRate = totalDeployments > 0 ? (totalFailedDeployments / totalDeployments) * 100 : 0;
        const dateRange = this.calculateDateRange(rawData.map(r => r.deployment_date), queryParams.startDate, queryParams.endDate);
        const response = {
            metric: 'change_failure_rate',
            data: rawData.map(row => ({
                date: row.deployment_date,
                organization_name: row.organization_name,
                project_name: row.project_name,
                application_name: row.application_name,
                environment_type: row.environment_type,
                total_deployments: row.total_deployments,
                failed_deployments: row.failed_deployments,
                failure_rate_percent: Math.round(row.change_failure_rate_percent * 100) / 100,
            })),
            summary: {
                overall_failure_rate: Math.round(overallFailureRate * 100) / 100,
                total_deployments: totalDeployments,
                total_failed_deployments: totalFailedDeployments,
                date_range: dateRange,
                filters_applied: this.extractFilters(queryParams),
            },
        };
        logger_1.logWithContext.info('Successfully processed change failure rate request', organizationName, {
            recordCount: response.data.length,
            overallFailureRate: response.summary.overall_failure_rate,
        });
        return response;
    }
    async getLeadTimeForChanges(params) {
        const { organizationName, ...queryParams } = params;
        logger_1.logWithContext.info('Processing lead time for changes request', organizationName, { params });
        const rawData = await databricks_service_1.databricksService.getLeadTimeForChanges({
            organizationName,
            ...queryParams,
        });
        const leadTimes = rawData.map(row => row.median_lead_time_hours).filter(time => time > 0);
        const overallMedianHours = this.calculateMedian(leadTimes);
        const dateRange = this.calculateDateRange(rawData.map(r => r.deployment_date), queryParams.startDate, queryParams.endDate);
        const response = {
            metric: 'lead_time_for_changes',
            data: rawData.map(row => ({
                date: row.deployment_date,
                organization_name: row.organization_name,
                project_name: row.project_name,
                application_name: row.application_name,
                environment_type: row.environment_type,
                median_lead_time_hours: Math.round(row.median_lead_time_hours * 100) / 100,
                lead_time_days: Math.round((row.median_lead_time_hours / 24) * 100) / 100,
            })),
            summary: {
                overall_median_hours: Math.round(overallMedianHours * 100) / 100,
                overall_median_days: Math.round((overallMedianHours / 24) * 100) / 100,
                date_range: dateRange,
                filters_applied: this.extractFilters(queryParams),
            },
        };
        logger_1.logWithContext.info('Successfully processed lead time for changes request', organizationName, {
            recordCount: response.data.length,
            overallMedianHours: response.summary.overall_median_hours,
        });
        return response;
    }
    async getMeanTimeToRestore(params) {
        const { organizationName, ...queryParams } = params;
        logger_1.logWithContext.info('Processing mean time to restore request', organizationName, { params });
        const rawData = await databricks_service_1.databricksService.getMeanTimeToRestore({
            organizationName,
            ...queryParams,
        });
        const mttrTimes = rawData.map(row => row.median_hours_to_restore).filter(time => time > 0);
        const overallMedianHours = this.calculateMedian(mttrTimes);
        const dateRange = this.calculateDateRange(rawData.map(r => r.deployment_date), queryParams.startDate, queryParams.endDate);
        const response = {
            metric: 'mean_time_to_restore',
            data: rawData.map(row => ({
                date: row.deployment_date,
                organization_name: row.organization_name,
                project_name: row.project_name,
                application_name: row.application_name,
                environment_type: row.environment_type,
                median_hours_to_restore: Math.round(row.median_hours_to_restore * 100) / 100,
                restore_time_days: Math.round((row.median_hours_to_restore / 24) * 100) / 100,
            })),
            summary: {
                overall_median_hours: Math.round(overallMedianHours * 100) / 100,
                overall_median_days: Math.round((overallMedianHours / 24) * 100) / 100,
                date_range: dateRange,
                filters_applied: this.extractFilters(queryParams),
            },
        };
        logger_1.logWithContext.info('Successfully processed mean time to restore request', organizationName, {
            recordCount: response.data.length,
            overallMedianHours: response.summary.overall_median_hours,
        });
        return response;
    }
    async getAllDoraMetrics(params) {
        const { organizationName, ...queryParams } = params;
        logger_1.logWithContext.info('Processing all DORA metrics request', organizationName, { params });
        const summary = await databricks_service_1.databricksService.getDoraMetricsSummary({
            organizationName,
            ...queryParams,
        });
        const dateRange = {
            start: queryParams.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            end: queryParams.endDate || new Date().toISOString(),
        };
        const response = {
            organization_name: organizationName,
            date_range: dateRange,
            metrics: {
                deployment_frequency: {
                    average_per_day: summary.deploymentFrequency.averagePerDay,
                    total_deployments: summary.deploymentFrequency.totalDeployments,
                },
                change_failure_rate: {
                    failure_rate_percent: summary.changeFailureRate.overallRate,
                    total_deployments: summary.changeFailureRate.totalDeployments,
                    failed_deployments: summary.changeFailureRate.failedDeployments,
                },
                lead_time_for_changes: {
                    median_hours: summary.leadTime.medianHours,
                    median_days: summary.leadTime.medianDays,
                },
                mean_time_to_restore: {
                    median_hours: summary.meanTimeToRestore.medianHours,
                    median_days: summary.meanTimeToRestore.medianDays,
                },
            },
            filters_applied: this.extractFilters(queryParams),
        };
        logger_1.logWithContext.info('Successfully processed all DORA metrics request', organizationName, {
            deploymentFrequency: response.metrics.deployment_frequency.average_per_day,
            changeFailureRate: response.metrics.change_failure_rate.failure_rate_percent,
            leadTime: response.metrics.lead_time_for_changes.median_days,
            mttr: response.metrics.mean_time_to_restore.median_days,
        });
        return response;
    }
    async getAvailableFilters(organizationName) {
        logger_1.logWithContext.info('Fetching available filters', organizationName);
        return await databricks_service_1.databricksService.getAvailableFilters(organizationName);
    }
    async validateOrganizationAccess(organizationName) {
        return await databricks_service_1.databricksService.validateOrganizationAccess(organizationName);
    }
    aggregateDeploymentData(rawData, aggregation) {
        if (aggregation === 'daily') {
            return rawData;
        }
        return rawData;
    }
    calculateMedian(numbers) {
        if (numbers.length === 0)
            return 0;
        const sorted = [...numbers].sort((a, b) => a - b);
        const middle = Math.floor(sorted.length / 2);
        if (sorted.length % 2 === 0) {
            return (sorted[middle - 1] + sorted[middle]) / 2;
        }
        return sorted[middle];
    }
    calculateDateRange(dates, startDate, endDate) {
        if (startDate && endDate) {
            return {
                start: startDate,
                end: endDate,
            };
        }
        if (dates.length === 0) {
            const now = new Date();
            const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            return {
                start: thirtyDaysAgo.toISOString(),
                end: now.toISOString(),
            };
        }
        const sortedDates = dates.sort();
        return {
            start: new Date(sortedDates[0]).toISOString(),
            end: new Date(sortedDates[sortedDates.length - 1]).toISOString(),
        };
    }
    extractFilters(params) {
        const filters = {};
        if (params.projectName)
            filters.projectName = params.projectName;
        if (params.applicationName)
            filters.applicationName = params.applicationName;
        if (params.environmentType)
            filters.environmentType = params.environmentType;
        if (params.startDate)
            filters.startDate = params.startDate;
        if (params.endDate)
            filters.endDate = params.endDate;
        if (params.timeRange)
            filters.timeRange = params.timeRange;
        return filters;
    }
}
exports.DoraService = DoraService;
exports.doraService = new DoraService();
//# sourceMappingURL=dora-service.js.map