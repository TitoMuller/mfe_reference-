// Updated frontend/src/types/api.ts
// Enhanced types to support the new aggregation context from backend

// Core API response types matching your microservice
export interface DateRange {
  start: string;
  end: string;
}

export interface BaseQueryParams {
  organizationName: string;
  startDate?: string;
  endDate?: string;
  projectName?: string;
  applicationName?: string;
  environmentType?: 'production' | 'staging' | 'development';
  timeRange?: '7d' | '30d' | '90d' | '1y';
}

// ENHANCED: Deployment Frequency Types with aggregation context
export interface DeploymentFrequencyData {
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
}

export interface DeploymentFrequencyResponse {
  metric: 'deployment_frequency';
  data: DeploymentFrequencyData[];
  summary: {
    organization_name: string;
    total_deployments: number;
    average_per_day: number;
    date_range: DateRange;
    filters_applied: Record<string, any>;
  };
}

// ENHANCED: Change Failure Rate Types with aggregation context
export interface ChangeFailureRateData {
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
}

export interface ChangeFailureRateResponse {
  metric: 'change_failure_rate';
  data: ChangeFailureRateData[];
  summary: {
    organization_name: string;
    overall_failure_rate: number;
    total_deployments: number;
    total_failed_deployments: number;
    date_range: DateRange;
    filters_applied: Record<string, any>;
  };
}

// ENHANCED: Lead Time Types with aggregation context
export interface LeadTimeData {
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
}

export interface LeadTimeResponse {
  metric: 'lead_time_for_changes';
  data: LeadTimeData[];
  summary: {
    organization_name: string;
    overall_median_hours: number;
    overall_median_days: number;
    total_changes: number;
    date_range: DateRange;
    filters_applied: Record<string, any>;
  };
}

// ENHANCED: Mean Time to Restore Types with aggregation context
export interface MeanTimeToRestoreData {
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
}

export interface MeanTimeToRestoreResponse {
  metric: 'mean_time_to_restore';
  data: MeanTimeToRestoreData[];
  summary: {
    organization_name: string;
    overall_median_hours: number;
    total_incidents: number;
    date_range: DateRange;
    filters_applied: Record<string, any>;
  };
}

// Filters Types (unchanged)
export interface FiltersResponse {
  organization_name: string;
  available_filters: {
    projects: string[];
    applications: string[];
    environments: string[];
  };
}

// Dashboard and UI Types (unchanged)
export interface DashboardFilters {
  timeRange?: '7d' | '30d' | '90d' | '1y';
  startDate?: string;
  endDate?: string;
  projectName?: string;
  applicationName?: string;
  environmentType?: 'production' | 'staging' | 'development';
}

export interface LoadingState {
  deploymentFrequency: boolean;
  changeFailureRate: boolean;
  leadTime: boolean;
  meanTimeToRestore: boolean;
  filters: boolean;
}

export interface ErrorState {
  deploymentFrequency: string | null;
  changeFailureRate: string | null;
  leadTime: string | null;
  meanTimeToRestore: string | null;
  filters: string | null;
}

// Enhanced API Error interface
export interface ApiError extends Error {
  statusCode?: number;
  organization?: string;
  timestamp?: string;
}