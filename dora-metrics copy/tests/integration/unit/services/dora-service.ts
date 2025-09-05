// tests/unit/services/dora.service.test.ts
import { doraService } from '@/services/dora-service';
import { databricksService } from '@/services/databricks.service';
import { DeploymentFrequencyRow } from '@/models/dora.models';

// Mock the databricksService
jest.mock('@/services/databricks.service');
const mockDatabricksService = databricksService as jest.Mocked<typeof databricksService>;

describe('DoraService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getDeploymentFrequency', () => {
    const mockOrganizationName = 'test-org';
    const mockParams = {
      organizationName: mockOrganizationName,
      startDate: '2024-01-01T00:00:00.000Z',
      endDate: '2024-01-31T23:59:59.999Z',
      environmentType: 'production' as const,
    };

    const mockRawData: DeploymentFrequencyRow[] = [
      {
        deployment_date: '2024-01-15',
        organization_name: 'test-org',
        project_name: 'web-app',
        application_name: 'frontend',
        environment_type: 'production',
        deployment_count: 5,
        deployment_timestamp: '2024-01-15T10:30:00.000Z',
        organization_created_date: '2023-01-01T00:00:00.000Z',
      },
      {
        deployment_date: '2024-01-16',
        organization_name: 'test-org',
        project_name: 'web-app',
        application_name: 'frontend', 
        environment_type: 'production',
        deployment_count: 3,
        deployment_timestamp: '2024-01-16T14:20:00.000Z',
        organization_created_date: '2023-01-01T00:00:00.000Z',
      },
    ];

    it('should return deployment frequency data with correct summary', async () => {
      // Arrange
      mockDatabricksService.getDeploymentFrequency.mockResolvedValue(mockRawData);

      // Act
      const result = await doraService.getDeploymentFrequency(mockParams);

      // Assert
      expect(result.metric).toBe('deployment_frequency');
      expect(result.data).toHaveLength(2);
      expect(result.summary.total_deployments).toBe(8); // 5 + 3
      expect(result.summary.average_per_day).toBe(4); // 8 deployments / 2 unique days
      
      // Verify service was called with correct parameters
      expect(mockDatabricksService.getDeploymentFrequency).toHaveBeenCalledWith({
        organizationName: mockOrganizationName,
        startDate: '2024-01-01T00:00:00.000Z',
        endDate: '2024-01-31T23:59:59.999Z',
        environmentType: 'production',
        aggregation: 'daily',
      });
    });

    it('should handle empty data gracefully', async () => {
      // Arrange
      mockDatabricksService.getDeploymentFrequency.mockResolvedValue([]);

      // Act
      const result = await doraService.getDeploymentFrequency(mockParams);

      // Assert  
      expect(result.data).toHaveLength(0);
      expect(result.summary.total_deployments).toBe(0);
      expect(result.summary.average_per_day).toBe(0);
    });

    it('should apply filters correctly', async () => {
      // Arrange
      const paramsWithFilters = {
        ...mockParams,
        projectName: 'mobile-app',
        applicationName: 'ios-app',
      };
      mockDatabricksService.getDeploymentFrequency.mockResolvedValue(mockRawData);

      // Act
      const result = await doraService.getDeploymentFrequency(paramsWithFilters);

      // Assert
      expect(result.summary.filters_applied).toEqual({
        startDate: '2024-01-01T00:00:00.000Z',
        endDate: '2024-01-31T23:59:59.999Z',
        environmentType: 'production',
        projectName: 'mobile-app',
        applicationName: 'ios-app',
      });
    });

    it('should propagate database errors', async () => {
      // Arrange
      const dbError = new Error('Database connection failed');
      mockDatabricksService.getDeploymentFrequency.mockRejectedValue(dbError);

      // Act & Assert
      await expect(doraService.getDeploymentFrequency(mockParams)).rejects.toThrow('Database connection failed');
    });
  });

  describe('calculateMedian', () => {
    it('should calculate median correctly for odd number of elements', () => {
      // Test private method via public method that uses it
      const mockLeadTimeData = [
        {
          deployment_date: '2024-01-15',
          organization_name: 'test-org',
          project_name: 'test-project',
          application_name: 'test-app',
          environment_type: 'production',
          deployedAt: '2024-01-15T10:30:00.000Z',
          median_lead_time_hours: 4, // Values: [2, 4, 6] -> median should be 4
        },
        {
          deployment_date: '2024-01-16',
          organization_name: 'test-org',
          project_name: 'test-project',
          application_name: 'test-app',
          environment_type: 'production',
          deployedAt: '2024-01-16T10:30:00.000Z',
          median_lead_time_hours: 2,
        },
        {
          deployment_date: '2024-01-17',
          organization_name: 'test-org',
          project_name: 'test-project',
          application_name: 'test-app',
          environment_type: 'production',
          deployedAt: '2024-01-17T10:30:00.000Z',
          median_lead_time_hours: 6,
        },
      ];

      mockDatabricksService.getLeadTimeForChanges.mockResolvedValue(mockLeadTimeData);

      return doraService.getLeadTimeForChanges({
        organizationName: 'test-org',
      }).then(result => {
        expect(result.summary.overall_median_hours).toBe(4);
      });
    });
  });
});