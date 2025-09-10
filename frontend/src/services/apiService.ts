import {
  BaseQueryParams,
  DeploymentFrequencyResponse,
  ChangeFailureRateResponse,
  LeadTimeResponse,
  MeanTimeToRestoreResponse,
  FiltersResponse,
  ApiError,
} from '@/types/api';

/**
 * API Service class for communicating with DORA metrics microservice
 * 
 * This class handles all HTTP requests to your existing microservice endpoints,
 * including proper error handling, logging, and organization-level security.
 */
class ApiService {
  private baseUrl: string;
  private organizationName: string;

  constructor() {
    // Use environment variable for base URL, default to development proxy
    this.baseUrl = import.meta.env.VITE_API_BASE_URL || '/api/v1/dora';
    
    // Organization name should come from Zephyr's context when embedded
    this.organizationName = import.meta.env.VITE_ORGANIZATION_NAME || 'zephyrcloudio';
    
    console.log('ApiService initialized', {
      baseUrl: this.baseUrl,
      organizationName: this.organizationName,
      environment: import.meta.env.MODE,
    });
  }

  /**
   * Set organization context (called when embedded in Zephyr)
   */
  setOrganization(orgName: string): void {
    this.organizationName = orgName;
    console.log('Organization context updated:', orgName);
  }

  /**
   * Generic fetch wrapper with error handling and logging
   */
  private async fetchWithErrorHandling<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}/${this.organizationName}${endpoint}`;
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
      'x-organization-name': this.organizationName,
      // Add API key if required in production
      ...(import.meta.env.VITE_API_KEY && {
        'x-api-key': import.meta.env.VITE_API_KEY,
      }),
    };

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    console.log('API Request:', {
      method: config.method || 'GET',
      url,
      organization: this.organizationName,
    });

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: 'Unknown API error',
          statusCode: response.status,
        }));

        const apiError: ApiError = {
          message: errorData.message || `HTTP ${response.status}`,
          statusCode: response.status,
          organization: this.organizationName,
          timestamp: new Date().toISOString(),
        };

        console.error('API Error:', apiError);
        throw apiError;
      }

      const data = await response.json();
      
      console.log('API Response:', {
        endpoint,
        organization: this.organizationName,
        dataLength: Array.isArray(data.data) ? data.data.length : 'N/A',
        metric: data.metric,
      });

      return data as T;
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        // Network or CORS error
        const networkError: ApiError = {
          message: 'Network error - unable to connect to API',
          statusCode: 0,
          organization: this.organizationName,
          timestamp: new Date().toISOString(),
        };
        console.error('Network Error:', networkError);
        throw networkError;
      }
      
      // Re-throw API errors
      throw error;
    }
  }

  /**
   * Build query string from parameters
   */
  private buildQueryString(params: Partial<BaseQueryParams>): string {
    const query = new URLSearchParams();

    // Add all non-undefined parameters
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && key !== 'organizationName') {
        query.append(key, String(value));
      }
    });

    const queryString = query.toString();
    return queryString ? `?${queryString}` : '';
  }

  /**
   * Get deployment frequency metrics
   */
  async getDeploymentFrequency(
    params: Partial<BaseQueryParams> = {}
  ): Promise<DeploymentFrequencyResponse> {
    const queryString = this.buildQueryString(params);
    return this.fetchWithErrorHandling<DeploymentFrequencyResponse>(
      `/deployment-frequency${queryString}`
    );
  }

  /**
   * Get change failure rate metrics
   */
  async getChangeFailureRate(
    params: Partial<BaseQueryParams> = {}
  ): Promise<ChangeFailureRateResponse> {
    const queryString = this.buildQueryString(params);
    return this.fetchWithErrorHandling<ChangeFailureRateResponse>(
      `/change-failure-rate${queryString}`
    );
  }

  /**
   * Get lead time for changes metrics
   */
  async getLeadTimeForChanges(
    params: Partial<BaseQueryParams> = {}
  ): Promise<LeadTimeResponse> {
    const queryString = this.buildQueryString(params);
    return this.fetchWithErrorHandling<LeadTimeResponse>(
      `/lead-time-for-changes${queryString}`
    );
  }

  /**
   * Get mean time to restore metrics
   */
  async getMeanTimeToRestore(
    params: Partial<BaseQueryParams> = {}
  ): Promise<MeanTimeToRestoreResponse> {
    const queryString = this.buildQueryString(params);
    return this.fetchWithErrorHandling<MeanTimeToRestoreResponse>(
      `/mean-time-to-restore${queryString}`
    );
  }

  /**
   * Get available filters for the organization
   */
  async getFilters(): Promise<FiltersResponse> {
    return this.fetchWithErrorHandling<FiltersResponse>('/filters');
  }

  /**
   * Get all metrics in parallel for dashboard initialization
   * This is more efficient than making 4 separate API calls
   */
  async getAllMetrics(params: Partial<BaseQueryParams> = {}): Promise<{
    deploymentFrequency: DeploymentFrequencyResponse;
    changeFailureRate: ChangeFailureRateResponse;
    leadTime: LeadTimeResponse;
    meanTimeToRestore: MeanTimeToRestoreResponse;
  }> {
    console.log('Fetching all metrics in parallel...', {
      organization: this.organizationName,
      params,
    });

    try {
      const [
        deploymentFrequency,
        changeFailureRate,
        leadTime,
        meanTimeToRestore,
      ] = await Promise.all([
        this.getDeploymentFrequency(params),
        this.getChangeFailureRate(params),
        this.getLeadTimeForChanges(params),
        this.getMeanTimeToRestore(params),
      ]);

      console.log('All metrics fetched successfully');

      return {
        deploymentFrequency,
        changeFailureRate,
        leadTime,
        meanTimeToRestore,
      };
    } catch (error) {
      console.error('Error fetching metrics:', error);
      throw error;
    }
  }

  /**
   * Health check endpoint
   */
  async healthCheck(): Promise<{ status: 'ok' | 'error'; timestamp: string }> {
    try {
      await this.fetchWithErrorHandling('/health');
      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Health check failed:', error);
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
      };
    }
  }
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService;