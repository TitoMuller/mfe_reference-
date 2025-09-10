import winston from 'winston';
declare const logger: winston.Logger;
export declare const logWithContext: {
    info: (message: string, organizationName?: string, meta?: any) => void;
    error: (message: string, error?: Error, organizationName?: string, meta?: any) => void;
    warn: (message: string, organizationName?: string, meta?: any) => void;
    debug: (message: string, organizationName?: string, meta?: any) => void;
};
export { logger };
export default logger;
//# sourceMappingURL=logger.d.ts.map