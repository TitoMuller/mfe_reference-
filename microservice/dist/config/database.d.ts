import { DBSQLClient } from '@databricks/sql';
declare class DatabricksConnection {
    private client;
    private isConnecting;
    getClient(): Promise<DBSQLClient>;
    private connect;
    private testConnection;
    executeQuery<T = any>(sql: string, organizationName?: string, params?: Record<string, any>): Promise<T[]>;
    close(): Promise<void>;
    healthCheck(): Promise<{
        status: 'healthy' | 'unhealthy';
        details: any;
    }>;
}
export declare const databricksConnection: DatabricksConnection;
export {};
//# sourceMappingURL=database.d.ts.map