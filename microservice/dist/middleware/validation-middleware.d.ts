import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
export declare function validateRequest(schemas: {
    body?: ZodSchema;
    query?: ZodSchema;
    params?: ZodSchema;
}): (req: Request, res: Response, next: NextFunction) => void;
import { z } from 'zod';
export declare const organizationParamSchema: z.ZodObject<{
    organizationName: z.ZodString;
}, "strip", z.ZodTypeAny, {
    organizationName: string;
}, {
    organizationName: string;
}>;
export declare const dateRangeQuerySchema: z.ZodEffects<z.ZodObject<{
    startDate: z.ZodOptional<z.ZodString>;
    endDate: z.ZodOptional<z.ZodString>;
    timeRange: z.ZodOptional<z.ZodEnum<["7d", "30d", "90d", "1y"]>>;
}, "strip", z.ZodTypeAny, {
    startDate?: string | undefined;
    endDate?: string | undefined;
    timeRange?: "7d" | "30d" | "90d" | "1y" | undefined;
}, {
    startDate?: string | undefined;
    endDate?: string | undefined;
    timeRange?: "7d" | "30d" | "90d" | "1y" | undefined;
}>, {
    startDate?: string | undefined;
    endDate?: string | undefined;
    timeRange?: "7d" | "30d" | "90d" | "1y" | undefined;
}, {
    startDate?: string | undefined;
    endDate?: string | undefined;
    timeRange?: "7d" | "30d" | "90d" | "1y" | undefined;
}>;
export declare const filterQuerySchema: z.ZodObject<{
    projectName: z.ZodOptional<z.ZodString>;
    applicationName: z.ZodOptional<z.ZodString>;
    environmentType: z.ZodOptional<z.ZodEnum<["production", "staging", "development"]>>;
}, "strip", z.ZodTypeAny, {
    projectName?: string | undefined;
    applicationName?: string | undefined;
    environmentType?: "development" | "production" | "staging" | undefined;
}, {
    projectName?: string | undefined;
    applicationName?: string | undefined;
    environmentType?: "development" | "production" | "staging" | undefined;
}>;
export declare const paginationQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodEffects<z.ZodEffects<z.ZodString, number, string>, number, string>>;
    limit: z.ZodDefault<z.ZodEffects<z.ZodEffects<z.ZodString, number, string>, number, string>>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
}, {
    page?: string | undefined;
    limit?: string | undefined;
}>;
export declare const addDefaultTimeRange: (req: Request, res: Response, next: NextFunction) => void;
export declare const convertTimeRangeTodates: (req: Request, res: Response, next: NextFunction) => void;
export declare const validateDateRange: (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=validation-middleware.d.ts.map