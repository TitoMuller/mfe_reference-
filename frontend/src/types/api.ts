// Fixed types to support multi-select filters (updating existing types)

export interface DateRange {
  start: string;
  end: string;
}

/**
 * DashboardFilters (FIXED to support both single values and arrays)
 * Maintains backward compatibility while enabling multi-select
 */
export interface DashboardFilters {
  timeRange?: '7d' | '30d' | '90d' | '1y';
  startDate?: string;
  endDate?: string;
  projectName?: string | string[];        // Now supports both single and multi-select
  applicationName?: string | string[];    // Now supports both single and multi-select  
  environmentType?: string | string[];    // Now supports both single and multi-select
}

/**
 * BaseQueryParams (FIXED to support arrays)
 */
export interface BaseQueryParams {
  organizationName: string;
  startDate?: string;
  endDate?: string;
  projectName?: string | string[];        // Backend accepts both formats
  applicationName?: string | string[];    // Backend accepts both formats
  environmentType?: string | string[];    // Backend accepts both formats
  timeRange?: '7d' | '30d' | '90d' | '1y';
}

// Re-export all existing response types (unchanged)
export interface DeploymentFrequencyData {
  date: string;
  organization_name: string;
  deployment_count: number;
  daily_average?: number;
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

export interface ChangeFailureRateData {
  date: string;
  organization_name: string;
  total_deployments: number;
  failed_deployments: number;
  failure_rate_percent: number;
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

export interface LeadTimeData {
  date: string;
  organization_name: string;
  median_lead_time_hours: number;
  lead_time_days: number;
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

export interface MeanTimeToRestoreData {
  date: string;
  organization_name: string;
  median_hours_to_restore: number;
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
  timestamp: string;
}

// Dashboard and UI Types (unchanged except for DashboardFilters above)
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

/**
 * Environment Filter Values (NEW - for the environment filter requirement)
 * These are the exact values that should appear in the Environment filter
 */
export type EnvironmentType = 'Production' | 'Non-production';

/**
 * Helper function to normalize filter values to arrays (NEW)
 * Helps convert single values to arrays for consistent handling
 */
export const normalizeFilterValue = (value: string | string[] | undefined): string[] => {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
};

/**
 * Helper function to check if environment filter should include all (NEW)
 * According to spec: empty selection behaves same as selecting both
 */
export const shouldIncludeAllEnvironments = (environmentFilters: string | string[] | undefined): boolean => {
  const envArray = normalizeFilterValue(environmentFilters);
  return envArray.length === 0 || envArray.length === 2;
};

/**
 * Helper function to get effective environment filter for API calls (NEW)
 * Implements the logic: empty selection = both Production and Non-production
 */
export const getEffectiveEnvironmentFilter = (environmentFilters: string | string[] | undefined): string[] => {
  if (shouldIncludeAllEnvironments(environmentFilters)) {
    return ['Production', 'Non-production'];
  }
  return normalizeFilterValue(environmentFilters);
};

/**
 * Helper function to check if any filters are applied (NEW)
 */
export const hasActiveFilters = (filters: DashboardFilters): boolean => {
  const projectArray = normalizeFilterValue(filters.projectName);
  const appArray = normalizeFilterValue(filters.applicationName);
  const envArray = normalizeFilterValue(filters.environmentType);
  
  return projectArray.length > 0 || appArray.length > 0 || envArray.length > 0;
};

/**
 * Helper function to get filter display text (NEW)
 * Used for showing user-friendly filter summaries
 */
export const getFilterDisplayText = (filterValue: string | string[] | undefined, allLabel: string = 'All'): string => {
  const valueArray = normalizeFilterValue(filterValue);
  
  if (valueArray.length === 0) return allLabel;
  if (valueArray.length === 1) return valueArray[0];
  return `${valueArray.length} selected`;
};