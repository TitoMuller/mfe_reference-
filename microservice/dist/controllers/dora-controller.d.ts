import { Response } from 'express';
import { AuthenticatedRequest } from '@/middleware/auth-middleware';
export declare class DoraController {
    getDeploymentFrequency(req: AuthenticatedRequest, res: Response): Promise<void>;
    getChangeFailureRate(req: AuthenticatedRequest, res: Response): Promise<void>;
    getLeadTimeForChanges(req: AuthenticatedRequest, res: Response): Promise<void>;
    getMeanTimeToRestore(req: AuthenticatedRequest, res: Response): Promise<void>;
    getAllMetrics(req: AuthenticatedRequest, res: Response): Promise<void>;
    getAvailableFilters(req: AuthenticatedRequest, res: Response): Promise<void>;
    getOrganizationHealth(req: AuthenticatedRequest, res: Response): Promise<void>;
}
export declare const doraController: DoraController;
//# sourceMappingURL=dora-controller.d.ts.map