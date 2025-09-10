import { z } from 'zod';
export interface DeploymentFrequencyRow {
    deployment_date: string;
    organization_name: string;
    project_name: string;
    application_name: string;
    environment_type: string;
    deployment_count: number;
    deployment_timestamp: string;
    organization_created_date: string;
}
export interface ChangeFailureRateRow {
    deployment_date: string;
    organization_name: string;
    project_name: string;
    application_name: string;
    environment_type: string;
    total_deployments: number;
    failed_deployments: number;
    change_failure_rate_percent: number;
    deployment_timestamp: string;
    organization_created_date: string;
}
export interface LeadTimeForChangesRow {
    organization_name: string;
    project_name: string;
    application_name: string;
    environment_type: string;
    deployment_date: string;
    deployedAt: string;
    median_lead_time_hours: number;
}
export interface MeanTimeToRestoreRow {
    deployment_date: string;
    organization_name: string;
    project_name: string;
    application_name: string;
    environment_type: string;
    median_hours_to_restore: number;
    deployedAt: string;
}
export declare const baseQuerySchema: z.ZodObject<{
    organizationName: z.ZodString;
    startDate: z.ZodOptional<z.ZodString>;
    endDate: z.ZodOptional<z.ZodString>;
    projectName: z.ZodOptional<z.ZodString>;
    applicationName: z.ZodOptional<z.ZodString>;
    environmentType: z.ZodOptional<z.ZodEnum<["production", "staging", "development"]>>;
    timeRange: z.ZodOptional<z.ZodEnum<["7d", "30d", "90d", "1y"]>>;
}, "strip", z.ZodTypeAny, {
    organizationName: string;
    startDate?: string | undefined;
    endDate?: string | undefined;
    projectName?: string | undefined;
    applicationName?: string | undefined;
    environmentType?: "development" | "production" | "staging" | undefined;
    timeRange?: "7d" | "30d" | "90d" | "1y" | undefined;
}, {
    organizationName: string;
    startDate?: string | undefined;
    endDate?: string | undefined;
    projectName?: string | undefined;
    applicationName?: string | undefined;
    environmentType?: "development" | "production" | "staging" | undefined;
    timeRange?: "7d" | "30d" | "90d" | "1y" | undefined;
}>;
export declare const deploymentFrequencyQuerySchema: z.ZodObject<{
    organizationName: z.ZodString;
    startDate: z.ZodOptional<z.ZodString>;
    endDate: z.ZodOptional<z.ZodString>;
    projectName: z.ZodOptional<z.ZodString>;
    applicationName: z.ZodOptional<z.ZodString>;
    environmentType: z.ZodOptional<z.ZodEnum<["production", "staging", "development"]>>;
    timeRange: z.ZodOptional<z.ZodEnum<["7d", "30d", "90d", "1y"]>>;
} & {
    aggregation: z.ZodDefault<z.ZodEnum<["daily", "weekly", "monthly"]>>;
}, "strip", z.ZodTypeAny, {
    organizationName: string;
    aggregation: "daily" | "weekly" | "monthly";
    startDate?: string | undefined;
    endDate?: string | undefined;
    projectName?: string | undefined;
    applicationName?: string | undefined;
    environmentType?: "development" | "production" | "staging" | undefined;
    timeRange?: "7d" | "30d" | "90d" | "1y" | undefined;
}, {
    organizationName: string;
    startDate?: string | undefined;
    endDate?: string | undefined;
    projectName?: string | undefined;
    applicationName?: string | undefined;
    environmentType?: "development" | "production" | "staging" | undefined;
    timeRange?: "7d" | "30d" | "90d" | "1y" | undefined;
    aggregation?: "daily" | "weekly" | "monthly" | undefined;
}>;
export declare const changeFailureRateQuerySchema: z.ZodObject<{
    organizationName: z.ZodString;
    startDate: z.ZodOptional<z.ZodString>;
    endDate: z.ZodOptional<z.ZodString>;
    projectName: z.ZodOptional<z.ZodString>;
    applicationName: z.ZodOptional<z.ZodString>;
    environmentType: z.ZodOptional<z.ZodEnum<["production", "staging", "development"]>>;
    timeRange: z.ZodOptional<z.ZodEnum<["7d", "30d", "90d", "1y"]>>;
} & {
    includeDetails: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    organizationName: string;
    includeDetails: boolean;
    startDate?: string | undefined;
    endDate?: string | undefined;
    projectName?: string | undefined;
    applicationName?: string | undefined;
    environmentType?: "development" | "production" | "staging" | undefined;
    timeRange?: "7d" | "30d" | "90d" | "1y" | undefined;
}, {
    organizationName: string;
    startDate?: string | undefined;
    endDate?: string | undefined;
    projectName?: string | undefined;
    applicationName?: string | undefined;
    environmentType?: "development" | "production" | "staging" | undefined;
    timeRange?: "7d" | "30d" | "90d" | "1y" | undefined;
    includeDetails?: boolean | undefined;
}>;
export declare const leadTimeQuerySchema: z.ZodObject<{
    organizationName: z.ZodString;
    startDate: z.ZodOptional<z.ZodString>;
    endDate: z.ZodOptional<z.ZodString>;
    projectName: z.ZodOptional<z.ZodString>;
    applicationName: z.ZodOptional<z.ZodString>;
    environmentType: z.ZodOptional<z.ZodEnum<["production", "staging", "development"]>>;
    timeRange: z.ZodOptional<z.ZodEnum<["7d", "30d", "90d", "1y"]>>;
} & {
    percentile: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    organizationName: string;
    percentile: number;
    startDate?: string | undefined;
    endDate?: string | undefined;
    projectName?: string | undefined;
    applicationName?: string | undefined;
    environmentType?: "development" | "production" | "staging" | undefined;
    timeRange?: "7d" | "30d" | "90d" | "1y" | undefined;
}, {
    organizationName: string;
    startDate?: string | undefined;
    endDate?: string | undefined;
    projectName?: string | undefined;
    applicationName?: string | undefined;
    environmentType?: "development" | "production" | "staging" | undefined;
    timeRange?: "7d" | "30d" | "90d" | "1y" | undefined;
    percentile?: number | undefined;
}>;
export declare const meanTimeToRestoreQuerySchema: z.ZodObject<{
    organizationName: z.ZodString;
    startDate: z.ZodOptional<z.ZodString>;
    endDate: z.ZodOptional<z.ZodString>;
    projectName: z.ZodOptional<z.ZodString>;
    applicationName: z.ZodOptional<z.ZodString>;
    environmentType: z.ZodOptional<z.ZodEnum<["production", "staging", "development"]>>;
    timeRange: z.ZodOptional<z.ZodEnum<["7d", "30d", "90d", "1y"]>>;
} & {
    includeOutliers: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    organizationName: string;
    includeOutliers: boolean;
    startDate?: string | undefined;
    endDate?: string | undefined;
    projectName?: string | undefined;
    applicationName?: string | undefined;
    environmentType?: "development" | "production" | "staging" | undefined;
    timeRange?: "7d" | "30d" | "90d" | "1y" | undefined;
}, {
    organizationName: string;
    startDate?: string | undefined;
    endDate?: string | undefined;
    projectName?: string | undefined;
    applicationName?: string | undefined;
    environmentType?: "development" | "production" | "staging" | undefined;
    timeRange?: "7d" | "30d" | "90d" | "1y" | undefined;
    includeOutliers?: boolean | undefined;
}>;
export interface DeploymentFrequencyResponse {
    metric: 'deployment_frequency';
    data: Array<{
        date: string;
        organization_name: string;
        project_name?: string;
        application_name?: string;
        environment_type?: string;
        deployment_count: number;
        daily_average?: number;
    }>;
    summary: {
        total_deployments: number;
        average_per_day: number;
        date_range: {
            start: string;
            end: string;
        };
        filters_applied: Record<string, any>;
    };
}
export interface ChangeFailureRateResponse {
    metric: 'change_failure_rate';
    data: Array<{
        date: string;
        organization_name: string;
        project_name?: string;
        application_name?: string;
        environment_type?: string;
        total_deployments: number;
        failed_deployments: number;
        failure_rate_percent: number;
    }>;
    summary: {
        overall_failure_rate: number;
        total_deployments: number;
        total_failed_deployments: number;
        date_range: {
            start: string;
            end: string;
        };
        filters_applied: Record<string, any>;
    };
}
export interface LeadTimeResponse {
    metric: 'lead_time_for_changes';
    data: Array<{
        date: string;
        organization_name: string;
        project_name?: string;
        application_name?: string;
        environment_type?: string;
        median_lead_time_hours: number;
        lead_time_days: number;
    }>;
    summary: {
        overall_median_hours: number;
        overall_median_days: number;
        date_range: {
            start: string;
            end: string;
        };
        filters_applied: Record<string, any>;
    };
}
export interface MeanTimeToRestoreResponse {
    metric: 'mean_time_to_restore';
    data: Array<{
        date: string;
        organization_name: string;
        project_name?: string;
        application_name?: string;
        environment_type?: string;
        median_hours_to_restore: number;
        restore_time_days: number;
    }>;
    summary: {
        overall_median_hours: number;
        overall_median_days: number;
        date_range: {
            start: string;
            end: string;
        };
        filters_applied: Record<string, any>;
    };
}
export interface DoraMetricsResponse {
    organization_name: string;
    date_range: {
        start: string;
        end: string;
    };
    metrics: {
        deployment_frequency: {
            average_per_day: number;
            total_deployments: number;
        };
        change_failure_rate: {
            failure_rate_percent: number;
            total_deployments: number;
            failed_deployments: number;
        };
        lead_time_for_changes: {
            median_hours: number;
            median_days: number;
        };
        mean_time_to_restore: {
            median_hours: number;
            median_days: number;
        };
    };
    filters_applied: Record<string, any>;
}
export interface ApiErrorResponse {
    error: true;
    message: string;
    code?: string;
    details?: any;
    timestamp: string;
}
export interface HealthCheckResponse {
    status: 'healthy' | 'degraded' | 'unhealthy';
    timestamp: string;
    services: {
        database: {
            status: 'healthy' | 'unhealthy';
            response_time_ms?: number;
            details?: any;
        };
        api: {
            status: 'healthy';
            uptime_seconds: number;
        };
    };
}
export type BaseQueryParams = z.infer<typeof baseQuerySchema>;
export type DeploymentFrequencyQueryParams = z.infer<typeof deploymentFrequencyQuerySchema>;
export type ChangeFailureRateQueryParams = z.infer<typeof changeFailureRateQuerySchema>;
export type LeadTimeQueryParams = z.infer<typeof leadTimeQuerySchema>;
export type MeanTimeToRestoreQueryParams = z.infer<typeof meanTimeToRestoreQuerySchema>;
//# sourceMappingURL=dora-models.d.ts.map