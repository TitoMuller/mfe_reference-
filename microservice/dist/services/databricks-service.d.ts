import { DeploymentFrequencyRow, ChangeFailureRateRow, LeadTimeForChangesRow, MeanTimeToRestoreRow } from '@/models/dora-models';
export declare class DatabricksService {
    private readonly catalogSchema;
    constructor();
    getDeploymentFrequency(params: {
        organizationName: string;
        startDate?: string;
        endDate?: string;
        projectName?: string;
        applicationName?: string;
        environmentType?: string;
        aggregation?: 'daily' | 'weekly' | 'monthly';
    }): Promise<DeploymentFrequencyRow[]>;
    getChangeFailureRate(params: {
        organizationName: string;
        startDate?: string;
        endDate?: string;
        projectName?: string;
        applicationName?: string;
        environmentType?: string;
    }): Promise<ChangeFailureRateRow[]>;
    getLeadTimeForChanges(params: {
        organizationName: string;
        startDate?: string;
        endDate?: string;
        projectName?: string;
        applicationName?: string;
        environmentType?: string;
    }): Promise<LeadTimeForChangesRow[]>;
    getMeanTimeToRestore(params: {
        organizationName: string;
        startDate?: string;
        endDate?: string;
        projectName?: string;
        applicationName?: string;
        environmentType?: string;
    }): Promise<MeanTimeToRestoreRow[]>;
    getDoraMetricsSummary(params: {
        organizationName: string;
        startDate?: string;
        endDate?: string;
        projectName?: string;
        applicationName?: string;
        environmentType?: string;
    }): Promise<{
        deploymentFrequency: {
            totalDeployments: number;
            averagePerDay: number;
        };
        changeFailureRate: {
            overallRate: number;
            totalDeployments: number;
            failedDeployments: number;
        };
        leadTime: {
            medianHours: number;
            medianDays: number;
        };
        meanTimeToRestore: {
            medianHours: number;
            medianDays: number;
        };
    }>;
    validateOrganizationAccess(organizationName: string): Promise<boolean>;
    getAvailableFilters(organizationName: string): Promise<{
        projects: string[];
        applications: string[];
        environments: string[];
    }>;
}
export declare const databricksService: DatabricksService;
//# sourceMappingURL=databricks-service.d.ts.map