import { z } from 'zod';

/**
 * Base interfaces matching your Databricks gold table schemas
 * (Raw table structures - unchanged)
 */

// Deployment Frequency table structure
export interface DeploymentFrequencyRow {
  deployment_date: string;          // date
  organization_name: string;        // string
  project_name: string;            // string  
  application_name: string;        // string
  environment_type: string;        // string
  deployment_count: number;        // bigint
  deployment_timestamp: string;     // timestamp
  organization_created_date: string; // timestamp
}

// Change Failure Rate table structure
export interface ChangeFailureRateRow {
  deployment_date: string;          // date
  organization_name: string;        // string
  project_name: string;            // string
  application_name: string;        // string
  environment_type: string;        // string
  total_deployments: number;       // bigint
  failed_deployments: number;      // bigint
  change_failure_rate_percent: number; // decimal(27,2)
  deployment_timestamp: string;     // timestamp
  organization_created_date: string; // timestamp
}

// Lead Time for Changes table structure
export interface LeadTimeForChangesRow {
  organization_name: string;        // string
  project_name: string;            // string
  application_name: string;        // string
  environment_type: string;        // string
  deployment_date: string;         // date
  deployedAt: string;              // timestamp
  median_lead_time_hours: number;  // decimal(24,2)
}

// Mean Time to Restore table structure
export interface MeanTimeToRestoreRow {
  deployment_date: string;          // date
  organization_name: string;        // string
  project_name: string;            // string
  application_name: string;        // string
  environment_type: string;        // string
  median_hours_to_restore: number; // decimal(24,2)
  deployedAt: string;              // timestamp
}

/**
 * NEW: Aggregated database result interfaces
 * These represent what our SQL queries with GROUP BY return
 */

// Result from aggregated deployment frequency query
export interface AggregatedDeploymentFrequencyRow {
  deployment_date: string;
  organization_name: string;
  deployment_count: number;                    // SUM(deployment_count)
  project_count: number;                       // COUNT(DISTINCT project_name)
  application_count: number;                   // COUNT(DISTINCT application_name)
  environment_count: number;                   // COUNT(DISTINCT environment_type)
  projects: string[];                          // array_distinct(collect_list(project_name))
  applications: string[];                      // array_distinct(collect_list(application_name))
  environments: string[];                      // array_distinct(collect_list(environment_type))
}

// Result from aggregated change failure rate query
export interface AggregatedChangeFailureRateRow {
  deployment_date: string;
  organization_name: string;
  total_deployments: number;                   // SUM(total_deployments)
  failed_deployments: number;                  // SUM(failed_deployments)
  failure_rate_percent: number;               // calculated failure rate
  project_count: number;
  application_count: number;
  projects: string[];
  applications: string[];
  environments: string[];
}

// Result from aggregated lead time query
export interface AggregatedLeadTimeRow {
  deployment_date: string;
  organization_name: string;
  median_lead_time_hours: number;              // percentile_approx(median_lead_time_hours, 0.5)
  lead_time_days: number;                      // calculated from hours
  change_count: number;                        // COUNT(*)
  project_count: number;
  application_count: number;
  projects: string[];
  applications: string[];
  environments: string[];
}

// Result from aggregated MTTR query
export interface AggregatedMeanTimeToRestoreRow {
  deployment_date: string;
  organization_name: string;
  median_hours_to_restore: number;             // percentile_approx(median_hours_to_restore, 0.5)
  incident_count: number;                      // COUNT(*)
  project_count: number;
  application_count: number;
  projects: string[];
  applications: string[];
  environments: string[];
}

/**
 * API Request/Response Types - UPDATED for production aggregation
 */

// Common query parameters validation schema (unchanged)
export const baseQuerySchema = z.object({
  organizationName: z.string().min(1, 'Organization name is required'),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  projectName: z.string().optional(),
  applicationName: z.string().optional(),
  environmentType: z.enum(['production', 'staging', 'development']).optional(),
  timeRange: z.enum(['7d', '30d', '90d', '1y']).optional(),
});

// Specific schemas for different endpoints
export const deploymentFrequencyQuerySchema = baseQuerySchema.extend({
  aggregation: z.enum(['daily', 'weekly', 'monthly']).default('daily'),
});

export const changeFailureRateQuerySchema = baseQuerySchema.extend({
  includeDetails: z.boolean().default(false),
});

export const leadTimeQuerySchema = baseQuerySchema.extend({
  percentile: z.number().min(0).max(100).default(50),
});

export const meanTimeToRestoreQuerySchema = baseQuerySchema.extend({
  includeOutliers: z.boolean().default(false),
});

// ENHANCED: API Response types with aggregation context
export interface DeploymentFrequencyResponse {
  metric: 'deployment_frequency';
  data: Array<{
    date: string;
    organization_name: string;
    deployment_count: number;
    daily_average?: number;
    // NEW: Aggregation context from backend SQL
    project_count?: number;
    application_count?: number;
    environment_count?: number;
    projects?: string[];
    applications?: string[];
    environments?: string[];
  }>;
  summary: {
    organization_name: string;
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
    total_deployments: number;
    failed_deployments: number;
    failure_rate_percent: number;
    // NEW: Aggregation context from backend SQL
    project_count?: number;
    application_count?: number;
    projects?: string[];
    applications?: string[];
    environments?: string[];
  }>;
  summary: {
    organization_name: string;
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
    median_lead_time_hours: number;
    lead_time_days: number;
    // NEW: Aggregation context from backend SQL
    change_count?: number;
    project_count?: number;
    application_count?: number;
    projects?: string[];
    applications?: string[];
    environments?: string[];
  }>;
  summary: {
    organization_name: string;
    overall_median_hours: number;
    overall_median_days: number;
    total_changes: number;
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
    median_hours_to_restore: number;
    // NEW: Aggregation context from backend SQL
    incident_count?: number;
    project_count?: number;
    application_count?: number;
    projects?: string[];
    applications?: string[];
    environments?: string[];
  }>;
  summary: {
    organization_name: string;
    overall_median_hours: number;
    total_incidents: number;
    date_range: {
      start: string;
      end: string;
    };
    filters_applied: Record<string, any>;
  };
}

// Combined DORA metrics response (enhanced)
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
      // NEW: Context about data aggregation
      unique_projects: number;
      unique_applications: number;
    };
    change_failure_rate: {
      failure_rate_percent: number;
      total_deployments: number;
      failed_deployments: number;
    };
    lead_time_for_changes: {
      median_hours: number;
      median_days: number;
      total_changes: number;
    };
    mean_time_to_restore: {
      median_hours: number;
      median_days: number;
      total_incidents: number;
    };
  };
  filters_applied: Record<string, any>;
}

// Error response type (unchanged)
export interface ApiErrorResponse {
  error: true;
  message: string;
  code?: string;
  details?: any;
  timestamp: string;
}

// Health check response (unchanged)
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

// NEW: Available filters response (for dropdown populations)
export interface FiltersResponse {
  organization_name: string;
  available_filters: {
    projects: string[];
    applications: string[];
    environments: string[];
  };
}

// Type inference helpers
export type BaseQueryParams = z.infer<typeof baseQuerySchema>;
export type DeploymentFrequencyQueryParams = z.infer<typeof deploymentFrequencyQuerySchema>;
export type ChangeFailureRateQueryParams = z.infer<typeof changeFailureRateQuerySchema>;
export type LeadTimeQueryParams = z.infer<typeof leadTimeQuerySchema>;
export type MeanTimeToRestoreQueryParams = z.infer<typeof meanTimeToRestoreQuerySchema>;