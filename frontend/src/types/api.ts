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

// Deployment Frequency Types
export interface DeploymentFrequencyData {
  date: string;
  organization_name: string;
  project_name?: string;
  application_name?: string;
  environment_type?: string;
  deployment_count: number;
  daily_average?: number;
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

// Change Failure Rate Types
export interface ChangeFailureRateData {
  date: string;
  organization_name: string;
  project_name?: string;
  application_name?: string;
  environment_type?: string;
  total_deployments: number;
  failed_deployments: number;
  failure_rate_percent: number;
}

export interface ChangeFailureRateResponse {
  metric: 'change_failure_rate';
  data: ChangeFailureRateData[];
  summary: {
    overall_failure_rate: number;
    total_deployments: number;
    total_failed_deployments: number;
    date_range: DateRange;
    filters_applied: Record<string, any>;
  };
}

// Lead Time Types
export interface LeadTimeData {
  date: string;
  organization_name: string;
  project_name?: string;
  application_name?: string;
  environment_type?: string;
  median_lead_time_hours: number;
  lead_time_days: number;
}

export interface LeadTimeResponse {
  metric: 'lead_time_for_changes';
  data: LeadTimeData[];
  summary: {
    overall_median_hours: number;
    overall_median_days: number;
    date_range: DateRange;
    filters_applied: Record<string, any>;
  };
}

// Mean Time to Restore Types
export interface MeanTimeToRestoreData {
  date: string;
  organization_name: string;
  project_name?: string;
  application_name?: string;
  environment_type?: string;
  median_hours_to_restore: number;
}

export interface MeanTimeToRestoreResponse {
  metric: 'mean_time_to_restore';
  data: MeanTimeToRestoreData[];
  summary: {
    overall_median_hours: number;
    date_range: DateRange;
    filters_applied: Record<string, any>;
  };
}

// Filters Response
export interface FiltersResponse {
  organization_name: string;
  available_filters: {
    projects: string[];
    applications: string[];
    environments: ('production' | 'staging' | 'development')[];
  };
}

// Chart data types for visualization
export interface ChartDataPoint {
  date: string;
  value: number;
  [key: string]: any;
}

// Filter state for the dashboard - FIXED TO MATCH API TYPES
export interface DashboardFilters {
  timeRange: '7d' | '30d' | '90d' | '1y';
  startDate?: string;
  endDate?: string;
  projectName?: string;
  applicationName?: string;
  environmentType?: 'production' | 'staging' | 'development'; // FIXED: Changed from string to literal union
}

// API Error types
export interface ApiError {
  message: string;
  statusCode: number;
  organization?: string;
  timestamp: string;
}

// Loading states
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