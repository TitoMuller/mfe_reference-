import express from 'express';
declare class DoraMetricsServer {
    private app;
    private server;
    constructor();
    private setupMiddleware;
    private setupRoutes;
    private setupErrorHandling;
    start(): Promise<void>;
    private gracefulShutdown;
    getApp(): express.Application;
}
export { DoraMetricsServer };
export default DoraMetricsServer;
//# sourceMappingURL=index.d.ts.map