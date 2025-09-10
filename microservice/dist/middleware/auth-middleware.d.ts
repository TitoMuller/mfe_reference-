import { Request, Response, NextFunction } from 'express';
export interface AuthenticatedRequest extends Request {
    organizationName?: string;
    user?: {
        id: string;
        email: string;
        organizationName: string;
    };
}
export declare const authMiddleware: (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
export declare const validateOrganizationAccess: (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
//# sourceMappingURL=auth-middleware.d.ts.map