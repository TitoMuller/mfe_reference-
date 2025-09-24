import {
  BaseQueryParams,
  DeploymentFrequencyResponse,
  ChangeFailureRateResponse,
  LeadTimeResponse,
  MeanTimeToRestoreResponse,
  FiltersResponse,
} from '@/types/api';

/**
 * FIXED: Define ApiError interface here since it's not properly exported from types
 */
interface ApiError extends Error {
  statusCode?: number;
  organization?: string;
  timestamp?: string;
}

/**
 * FIXED: Define custom error types for better error handling
 */
interface NetworkError extends Error {
  code?: string;
  statusCode: number;
}

/**
 * API Service class for communicating with DORA metrics microservice
 * 
 * This class handles all HTTP requests to your existing microservice endpoints,
 * including proper error handling, logging, and organization-level security.
 */
class ApiService {
  private readonly baseUrl = '/api/v1/dora';
  private organizationName = 'zephyrcloudio'; // This should come from auth context

  /**
   * Set the organization name (typically from authentication context)
   */
  setOrganization(orgName: string) {
    this.organizationName = orgName;
  }

  /**
   * Generic fetch method with error handling (unchanged)
   */
  private async fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}/${this.organizationName}${endpoint}`;
    
    try {
      console.log(`API Call: ${options.method || 'GET'} ${url}`);
      
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'x-organization-name': this.organizationName,
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      const data = await response.json();
      console.log(`API Response: ${url}`, data);
      return data;
    } catch (error) {
      console.error(`API Error: ${url}`, error);
      throw error;
    }
  }

  /**
   * Build query string from parameters, handling arrays for multi-select (FIXED)
   */
  private buildQueryString(params: Record<string, any>): string {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          // Handle multi-select arrays - add each value as separate parameter
          value.forEach(item => {
            if (item !== undefined && item !== null && item !== '') {
              searchParams.append(key, item.toString());
            }
          });
        } else if (value !== '') {
          searchParams.append(key, value.toString());
        }
      }
    });
    
    return searchParams.toString();
  }

  /**
   * Get all available filters for the organization (unchanged name)
   */
  async getFilters(): Promise<FiltersResponse> {
    return this.fetchApi<FiltersResponse>('/filters');
  }

  /**
   * Get cascading filters - applications filtered by selected projects (NEW)
   * This enables the dependent filter behavior required in the spec
   */
  async getCascadingFilters(selectedProjects: string[]): Promise<{
    projects: string[];
    applications: string[];
    environments: string[];
  }> {
    const queryParams = selectedProjects.length > 0 
      ? `?${this.buildQueryString({ projectName: selectedProjects })}`
      : '';
    
    const response = await this.fetchApi<FiltersResponse>(`/filters${queryParams}`);
    return response.available_filters;
  }

  /**
   * Get deployment frequency (FIXED to support multi-select)
   */
  async getDeploymentFrequency(params: {
    startDate?: string;
    endDate?: string;
    timeRange?: string;
    projectName?: string | string[];
    applicationName?: string | string[];
    environmentType?: string | string[];
  }): Promise<DeploymentFrequencyResponse> {
    const queryString = this.buildQueryString(params);
    return this.fetchApi<DeploymentFrequencyResponse>(
      `/deployment-frequency${queryString ? `?${queryString}` : ''}`
    );
  }

  /**
   * Get change failure rate (FIXED to support multi-select)
   */
  async getChangeFailureRate(params: {
    startDate?: string;
    endDate?: string;
    timeRange?: string;
    projectName?: string | string[];
    applicationName?: string | string[];
    environmentType?: string | string[];
  }): Promise<ChangeFailureRateResponse> {
    const queryString = this.buildQueryString(params);
    return this.fetchApi<ChangeFailureRateResponse>(
      `/change-failure-rate${queryString ? `?${queryString}` : ''}`
    );
  }

  /**
   * Get lead time for changes (FIXED to support multi-select)
   */
  async getLeadTime(params: {
    startDate?: string;
    endDate?: string;
    timeRange?: string;
    projectName?: string | string[];
    applicationName?: string | string[];
    environmentType?: string | string[];
  }): Promise<LeadTimeResponse> {
    const queryString = this.buildQueryString(params);
    return this.fetchApi<LeadTimeResponse>(
      `/lead-time-for-changes${queryString ? `?${queryString}` : ''}`
    );
  }

  /**
   * Get mean time to restore (FIXED to support multi-select)
   */
  async getMeanTimeToRestore(params: {
    startDate?: string;
    endDate?: string;
    timeRange?: string;
    projectName?: string | string[];
    applicationName?: string | string[];
    environmentType?: string | string[];
  }): Promise<MeanTimeToRestoreResponse> {
    const queryString = this.buildQueryString(params);
    return this.fetchApi<MeanTimeToRestoreResponse>(
      `/mean-time-to-restore${queryString ? `?${queryString}` : ''}`
    );
  }

  /**
   * Get all metrics at once (FIXED to support multi-select)
   * This is more efficient than calling each metric individually
   */
  async getAllMetrics(params: {
    startDate?: string;
    endDate?: string;
    timeRange?: string;
    projectName?: string | string[];
    applicationName?: string | string[];
    environmentType?: string | string[];
  }) {
    // For now, fetch all metrics in parallel
    // In the future, this could be a single endpoint call
    const [
      deploymentFrequency,
      changeFailureRate,
      leadTime,
      meanTimeToRestore,
    ] = await Promise.all([
      this.getDeploymentFrequency(params),
      this.getChangeFailureRate(params),
      this.getLeadTime(params),
      this.getMeanTimeToRestore(params),
    ]);

    return {
      deploymentFrequency,
      changeFailureRate,
      leadTime,
      meanTimeToRestore,
    };
  }

  /**
   * Validate organization access and health (unchanged)
   */
  async getOrganizationHealth() {
    return this.fetchApi<{
      organization_name: string;
      status: string;
      has_data: boolean;
      data_summary?: {
        projects_count: number;
        applications_count: number;
        environments_count: number;
      };
      timestamp: string;
    }>('/health');
  }
}

// Export singleton instance (keeping existing name)
export const apiService = new ApiService();