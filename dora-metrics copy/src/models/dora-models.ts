import { z } from 'zod';

/**
 * Base interfaces matching your Databricks gold table schemas
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
 * API Request/Response Types
 */

// Common query parameters validation schema
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

// API Response types
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

// Combined DORA metrics response
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

// Error response type
export interface ApiErrorResponse {
  error: true;
  message: string;
  code?: string;
  details?: any;
  timestamp: string;
}

// Health check response
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

// Type inference helpers
export type BaseQueryParams = z.infer<typeof baseQuerySchema>;
export type DeploymentFrequencyQueryParams = z.infer<typeof deploymentFrequencyQuerySchema>;
export type ChangeFailureRateQueryParams = z.infer<typeof changeFailureRateQuerySchema>;
export type LeadTimeQueryParams = z.infer<typeof leadTimeQuerySchema>;
export type MeanTimeToRestoreQueryParams = z.infer<typeof meanTimeToRestoreQuerySchema>;