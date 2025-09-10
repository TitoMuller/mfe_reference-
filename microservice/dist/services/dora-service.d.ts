import { DeploymentFrequencyResponse, ChangeFailureRateResponse, LeadTimeResponse, MeanTimeToRestoreResponse, DoraMetricsResponse, DeploymentFrequencyQueryParams, ChangeFailureRateQueryParams, LeadTimeQueryParams, MeanTimeToRestoreQueryParams, BaseQueryParams } from '@/models/dora-models';
export declare class DoraService {
    getDeploymentFrequency(params: DeploymentFrequencyQueryParams): Promise<DeploymentFrequencyResponse>;
    getChangeFailureRate(params: ChangeFailureRateQueryParams): Promise<ChangeFailureRateResponse>;
    getLeadTimeForChanges(params: LeadTimeQueryParams): Promise<LeadTimeResponse>;
    getMeanTimeToRestore(params: MeanTimeToRestoreQueryParams): Promise<MeanTimeToRestoreResponse>;
    getAllDoraMetrics(params: BaseQueryParams): Promise<DoraMetricsResponse>;
    getAvailableFilters(organizationName: string): Promise<{
        projects: string[];
        applications: string[];
        environments: string[];
    }>;
    validateOrganizationAccess(organizationName: string): Promise<boolean>;
    private aggregateDeploymentData;
    private calculateMedian;
    private calculateDateRange;
    private extractFilters;
}
export declare const doraService: DoraService;
//# sourceMappingURL=dora-service.d.ts.map