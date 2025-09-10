"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.databricksService = exports.DatabricksService = void 0;
const database_1 = require("@/config/database");
const environment_1 = require("@/config/environment");
const error_middleware_1 = require("@/middleware/error-middleware");
const logger_1 = require("@/utils/logger");
class DatabricksService {
    catalogSchema;
    constructor() {
        this.catalogSchema = `${environment_1.config.DATABRICKS_CATALOG}.${environment_1.config.DATABRICKS_SCHEMA}`;
    }
    async getDeploymentFrequency(params) {
        const { organizationName, startDate, endDate, projectName, applicationName, environmentType } = params;
        try {
            logger_1.logWithContext.info('Fetching deployment frequency data', organizationName, { params });
            const whereConditions = ['organization_name = ${organizationName}'];
            const queryParams = { organizationName };
            if (startDate) {
                whereConditions.push('deployment_date >= ${startDate}');
                queryParams.startDate = startDate.split('T')[0];
            }
            if (endDate) {
                whereConditions.push('deployment_date <= ${endDate}');
                queryParams.endDate = endDate.split('T')[0];
            }
            if (projectName) {
                whereConditions.push('project_name = ${projectName}');
                queryParams.projectName = projectName;
            }
            if (applicationName) {
                whereConditions.push('application_name = ${applicationName}');
                queryParams.applicationName = applicationName;
            }
            if (environmentType) {
                whereConditions.push('environment_type = ${environmentType}');
                queryParams.environmentType = environmentType;
            }
            const sql = `
        SELECT 
          deployment_date,
          organization_name,
          project_name,
          application_name,
          environment_type,
          deployment_count,
          deployment_timestamp,
          organization_created_date
        FROM ${this.catalogSchema}.deployment_frequency
        WHERE ${whereConditions.join(' AND ')}
        ORDER BY deployment_date DESC, project_name, application_name
        LIMIT 10000
      `;
            const results = await database_1.databricksConnection.executeQuery(sql, organizationName, queryParams);
            logger_1.logWithContext.info('Successfully fetched deployment frequency data', organizationName, {
                recordCount: results.length,
                dateRange: { startDate, endDate },
            });
            return results;
        }
        catch (error) {
            logger_1.logWithContext.error('Failed to fetch deployment frequency data', error, organizationName, { params });
            (0, error_middleware_1.handleDatabaseError)(error, 'deployment frequency query');
            throw error;
        }
    }
    async getChangeFailureRate(params) {
        const { organizationName, startDate, endDate, projectName, applicationName, environmentType } = params;
        try {
            logger_1.logWithContext.info('Fetching change failure rate data', organizationName, { params });
            const whereConditions = ['organization_name = ${organizationName}'];
            const queryParams = { organizationName };
            if (startDate) {
                whereConditions.push('deployment_date >= ${startDate}');
                queryParams.startDate = startDate.split('T')[0];
            }
            if (endDate) {
                whereConditions.push('deployment_date <= ${endDate}');
                queryParams.endDate = endDate.split('T')[0];
            }
            if (projectName) {
                whereConditions.push('project_name = ${projectName}');
                queryParams.projectName = projectName;
            }
            if (applicationName) {
                whereConditions.push('application_name = ${applicationName}');
                queryParams.applicationName = applicationName;
            }
            if (environmentType) {
                whereConditions.push('environment_type = ${environmentType}');
                queryParams.environmentType = environmentType;
            }
            const sql = `
        SELECT 
          deployment_date,
          organization_name,
          project_name,
          application_name,
          environment_type,
          total_deployments,
          failed_deployments,
          change_failure_rate_percent,
          deployment_timestamp,
          organization_created_date
        FROM ${this.catalogSchema}.change_failure_rate
        WHERE ${whereConditions.join(' AND ')}
        ORDER BY deployment_date DESC, project_name, application_name
        LIMIT 10000
      `;
            const results = await database_1.databricksConnection.executeQuery(sql, organizationName, queryParams);
            logger_1.logWithContext.info('Successfully fetched change failure rate data', organizationName, {
                recordCount: results.length,
            });
            return results;
        }
        catch (error) {
            logger_1.logWithContext.error('Failed to fetch change failure rate data', error, organizationName, { params });
            (0, error_middleware_1.handleDatabaseError)(error, 'change failure rate query');
            throw error;
        }
    }
    async getLeadTimeForChanges(params) {
        const { organizationName, startDate, endDate, projectName, applicationName, environmentType } = params;
        try {
            logger_1.logWithContext.info('Fetching lead time for changes data', organizationName, { params });
            const whereConditions = ['organization_name = ${organizationName}'];
            const queryParams = { organizationName };
            if (startDate) {
                whereConditions.push('deployment_date >= ${startDate}');
                queryParams.startDate = startDate.split('T')[0];
            }
            if (endDate) {
                whereConditions.push('deployment_date <= ${endDate}');
                queryParams.endDate = endDate.split('T')[0];
            }
            if (projectName) {
                whereConditions.push('project_name = ${projectName}');
                queryParams.projectName = projectName;
            }
            if (applicationName) {
                whereConditions.push('application_name = ${applicationName}');
                queryParams.applicationName = applicationName;
            }
            if (environmentType) {
                whereConditions.push('environment_type = ${environmentType}');
                queryParams.environmentType = environmentType;
            }
            const sql = `
        SELECT 
          organization_name,
          project_name,
          application_name,
          environment_type,
          deployment_date,
          deployedAt,
          median_lead_time_hours
        FROM ${this.catalogSchema}.lead_time_for_changes
        WHERE ${whereConditions.join(' AND ')}
        ORDER BY deployment_date DESC, project_name, application_name
        LIMIT 10000
      `;
            const results = await database_1.databricksConnection.executeQuery(sql, organizationName, queryParams);
            logger_1.logWithContext.info('Successfully fetched lead time for changes data', organizationName, {
                recordCount: results.length,
            });
            return results;
        }
        catch (error) {
            logger_1.logWithContext.error('Failed to fetch lead time for changes data', error, organizationName, { params });
            (0, error_middleware_1.handleDatabaseError)(error, 'lead time for changes query');
            throw error;
        }
    }
    async getMeanTimeToRestore(params) {
        const { organizationName, startDate, endDate, projectName, applicationName, environmentType } = params;
        try {
            logger_1.logWithContext.info('Fetching mean time to restore data', organizationName, { params });
            const whereConditions = ['organization_name = ${organizationName}'];
            const queryParams = { organizationName };
            if (startDate) {
                whereConditions.push('deployment_date >= ${startDate}');
                queryParams.startDate = startDate.split('T')[0];
            }
            if (endDate) {
                whereConditions.push('deployment_date <= ${endDate}');
                queryParams.endDate = endDate.split('T')[0];
            }
            if (projectName) {
                whereConditions.push('project_name = ${projectName}');
                queryParams.projectName = projectName;
            }
            if (applicationName) {
                whereConditions.push('application_name = ${applicationName}');
                queryParams.applicationName = applicationName;
            }
            if (environmentType) {
                whereConditions.push('environment_type = ${environmentType}');
                queryParams.environmentType = environmentType;
            }
            const sql = `
        SELECT 
          deployment_date,
          organization_name,
          project_name,
          application_name,
          environment_type,
          median_hours_to_restore,
          deployedAt
        FROM ${this.catalogSchema}.mean_time_to_restore
        WHERE ${whereConditions.join(' AND ')}
        ORDER BY deployment_date DESC, project_name, application_name
        LIMIT 10000
      `;
            const results = await database_1.databricksConnection.executeQuery(sql, organizationName, queryParams);
            logger_1.logWithContext.info('Successfully fetched mean time to restore data', organizationName, {
                recordCount: results.length,
            });
            return results;
        }
        catch (error) {
            logger_1.logWithContext.error('Failed to fetch mean time to restore data', error, organizationName, { params });
            (0, error_middleware_1.handleDatabaseError)(error, 'mean time to restore query');
            throw error;
        }
    }
    async getDoraMetricsSummary(params) {
        const { organizationName } = params;
        try {
            logger_1.logWithContext.info('Fetching DORA metrics summary', organizationName, { params });
            const [deploymentData, changeFailureData, leadTimeData, mttrData] = await Promise.all([
                this.getDeploymentFrequency(params),
                this.getChangeFailureRate(params),
                this.getLeadTimeForChanges(params),
                this.getMeanTimeToRestore(params),
            ]);
            const totalDeployments = deploymentData.reduce((sum, row) => sum + row.deployment_count, 0);
            const uniqueDays = new Set(deploymentData.map(row => row.deployment_date)).size;
            const averagePerDay = uniqueDays > 0 ? totalDeployments / uniqueDays : 0;
            const totalDeploymentsForCFR = changeFailureData.reduce((sum, row) => sum + row.total_deployments, 0);
            const totalFailedDeployments = changeFailureData.reduce((sum, row) => sum + row.failed_deployments, 0);
            const overallChangeFailureRate = totalDeploymentsForCFR > 0
                ? (totalFailedDeployments / totalDeploymentsForCFR) * 100
                : 0;
            const leadTimes = leadTimeData.map(row => row.median_lead_time_hours).filter(time => time > 0);
            const medianLeadTimeHours = leadTimes.length > 0
                ? leadTimes.sort((a, b) => a - b)[Math.floor(leadTimes.length / 2)]
                : 0;
            const mttrTimes = mttrData.map(row => row.median_hours_to_restore).filter(time => time > 0);
            const medianMttrHours = mttrTimes.length > 0
                ? mttrTimes.sort((a, b) => a - b)[Math.floor(mttrTimes.length / 2)]
                : 0;
            const summary = {
                deploymentFrequency: {
                    totalDeployments,
                    averagePerDay: Math.round(averagePerDay * 100) / 100,
                },
                changeFailureRate: {
                    overallRate: Math.round(overallChangeFailureRate * 100) / 100,
                    totalDeployments: totalDeploymentsForCFR,
                    failedDeployments: totalFailedDeployments,
                },
                leadTime: {
                    medianHours: Math.round(medianLeadTimeHours * 100) / 100,
                    medianDays: Math.round((medianLeadTimeHours / 24) * 100) / 100,
                },
                meanTimeToRestore: {
                    medianHours: Math.round(medianMttrHours * 100) / 100,
                    medianDays: Math.round((medianMttrHours / 24) * 100) / 100,
                },
            };
            logger_1.logWithContext.info('Successfully calculated DORA metrics summary', organizationName, { summary });
            return summary;
        }
        catch (error) {
            logger_1.logWithContext.error('Failed to fetch DORA metrics summary', error, organizationName, { params });
            (0, error_middleware_1.handleDatabaseError)(error, 'DORA metrics summary query');
            throw error;
        }
    }
    async validateOrganizationAccess(organizationName) {
        try {
            const sql = `
        SELECT COUNT(*) as record_count
        FROM ${this.catalogSchema}.deployment_frequency
        WHERE organization_name = ${organizationName}
        LIMIT 1
      `;
            const results = await database_1.databricksConnection.executeQuery(sql, organizationName, { organizationName });
            const hasData = results.length > 0 && results[0].record_count > 0;
            logger_1.logWithContext.info(`Organization access validation`, organizationName, {
                hasData,
                recordCount: results[0]?.record_count || 0
            });
            return hasData;
        }
        catch (error) {
            logger_1.logWithContext.error('Failed to validate organization access', error, organizationName);
            return false;
        }
    }
    async getAvailableFilters(organizationName) {
        try {
            logger_1.logWithContext.info('Fetching available filters', organizationName);
            const sql = `
        SELECT DISTINCT 
          project_name,
          application_name,
          environment_type
        FROM ${this.catalogSchema}.deployment_frequency
        WHERE organization_name = ${organizationName}
        ORDER BY project_name, application_name, environment_type
      `;
            const results = await database_1.databricksConnection.executeQuery(sql, organizationName, { organizationName });
            const projects = [...new Set(results.map(r => r.project_name))].filter(Boolean);
            const applications = [...new Set(results.map(r => r.application_name))].filter(Boolean);
            const environments = [...new Set(results.map(r => r.environment_type))].filter(Boolean);
            const filters = { projects, applications, environments };
            logger_1.logWithContext.info('Successfully fetched available filters', organizationName, filters);
            return filters;
        }
        catch (error) {
            logger_1.logWithContext.error('Failed to fetch available filters', error, organizationName);
            (0, error_middleware_1.handleDatabaseError)(error, 'available filters query');
            throw error;
        }
    }
}
exports.DatabricksService = DatabricksService;
exports.databricksService = new DatabricksService();
//# sourceMappingURL=databricks-service.js.map