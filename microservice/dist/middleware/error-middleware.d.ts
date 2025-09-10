import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AuthenticatedRequest } from './auth-middleware';
export declare class AppError extends Error {
    statusCode: number;
    code?: string | undefined;
    isOperational: boolean;
    constructor(message: string, statusCode?: number, code?: string, isOperational?: boolean);
}
export declare class DatabaseError extends AppError {
    constructor(message: string, originalError?: Error);
}
export declare class ValidationError extends AppError {
    validationErrors: any;
    constructor(message: string, validationErrors?: any);
}
export declare class OrganizationAccessError extends AppError {
    constructor(organizationName: string);
}
export declare class RateLimitError extends AppError {
    constructor();
}
export declare const errorHandler: (error: Error, req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
export declare const asyncHandler: (fn: Function) => (req: Request, res: Response, next: NextFunction) => void;
export declare const notFoundHandler: (req: Request, res: Response) => void;
export declare const handleDatabaseError: (error: Error, operation: string) => never;
export declare const handleValidationError: (zodError: ZodError, field?: string) => never;
//# sourceMappingURL=error-middleware.d.ts.map