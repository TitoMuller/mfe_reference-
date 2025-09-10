"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.databricksConnection = void 0;
const sql_1 = require("@databricks/sql");
const environment_1 = require("./environment");
const logger_1 = require("@/utils/logger");
class DatabricksConnection {
    client = null;
    isConnecting = false;
    async getClient() {
        if (this.client) {
            return this.client;
        }
        if (this.isConnecting) {
            return new Promise((resolve, reject) => {
                const checkConnection = () => {
                    if (this.client) {
                        resolve(this.client);
                    }
                    else if (!this.isConnecting) {
                        reject(new Error('Connection attempt failed'));
                    }
                    else {
                        setTimeout(checkConnection, 100);
                    }
                };
                checkConnection();
            });
        }
        return this.connect();
    }
    async connect() {
        this.isConnecting = true;
        try {
            logger_1.logger.info('Connecting to Databricks...', {
                hostname: environment_1.config.DATABRICKS_SERVER_HOSTNAME,
                httpPath: environment_1.config.DATABRICKS_HTTP_PATH,
                catalog: environment_1.config.DATABRICKS_CATALOG,
                schema: environment_1.config.DATABRICKS_SCHEMA
            });
            this.client = new sql_1.DBSQLClient();
            await this.client.connect({
                host: environment_1.config.DATABRICKS_SERVER_HOSTNAME,
                path: environment_1.config.DATABRICKS_HTTP_PATH,
                token: environment_1.config.DATABRICKS_TOKEN,
            });
            logger_1.logger.info('Successfully connected to Databricks');
            await this.testConnection();
            return this.client;
        }
        catch (error) {
            this.client = null;
            logger_1.logger.error('Failed to connect to Databricks', error);
            throw new Error(`Databricks connection failed: ${error.message}`);
        }
        finally {
            this.isConnecting = false;
        }
    }
    async testConnection() {
        if (!this.client) {
            throw new Error('Client not initialized');
        }
        try {
            const session = await this.client.openSession();
            const operation = await session.executeStatement(`USE CATALOG ${environment_1.config.DATABRICKS_CATALOG}`);
            await operation.fetchAll();
            await operation.close();
            const schemaOperation = await session.executeStatement(`USE SCHEMA ${environment_1.config.DATABRICKS_SCHEMA}`);
            await schemaOperation.fetchAll();
            await schemaOperation.close();
            const countOperation = await session.executeStatement(`SHOW TABLES IN ${environment_1.config.DATABRICKS_CATALOG}.${environment_1.config.DATABRICKS_SCHEMA}`);
            const result = await countOperation.fetchAll();
            await countOperation.close();
            await session.close();
            const tableCount = result.length || 0;
            logger_1.logger.info(`Connection test successful. Found ${tableCount} tables in ${environment_1.config.DATABRICKS_CATALOG}.${environment_1.config.DATABRICKS_SCHEMA}`);
            if (tableCount === 0) {
                logger_1.logger.warn(`No tables found in ${environment_1.config.DATABRICKS_CATALOG}.${environment_1.config.DATABRICKS_SCHEMA}. Please verify your schema configuration.`);
            }
        }
        catch (error) {
            logger_1.logger.error('Connection test failed', error);
            throw error;
        }
    }
    async executeQuery(sql, organizationName, params) {
        const client = await this.getClient();
        let session;
        let operation;
        try {
            logger_1.logWithContext.debug('Executing query', organizationName, {
                sql: sql.slice(0, 200) + (sql.length > 200 ? '...' : ''),
                params
            });
            session = await client.openSession();
            await session.executeStatement(`USE CATALOG ${environment_1.config.DATABRICKS_CATALOG}`);
            await session.executeStatement(`USE SCHEMA ${environment_1.config.DATABRICKS_SCHEMA}`);
            let finalSql = sql;
            if (params) {
                Object.entries(params).forEach(([key, value]) => {
                    const placeholder = `\${${key}}`;
                    finalSql = finalSql.replace(new RegExp(`\\$\\{${key}\\}`, 'g'), typeof value === 'string' ? `'${value}'` : String(value));
                });
            }
            operation = await session.executeStatement(finalSql);
            const results = await operation.fetchAll();
            logger_1.logWithContext.info(`Query executed successfully`, organizationName, {
                rowCount: results.length,
            });
            return results;
        }
        catch (error) {
            logger_1.logWithContext.error('Query execution failed', error, organizationName, {
                sql: sql.slice(0, 200) + (sql.length > 200 ? '...' : ''),
                params
            });
            throw error;
        }
        finally {
            try {
                if (operation)
                    await operation.close();
                if (session)
                    await session.close();
            }
            catch (closeError) {
                logger_1.logger.warn('Error closing database resources', closeError);
            }
        }
    }
    async close() {
        if (this.client) {
            try {
                await this.client.close();
                logger_1.logger.info('Databricks connection closed successfully');
            }
            catch (error) {
                logger_1.logger.error('Error closing Databricks connection', error);
            }
            finally {
                this.client = null;
            }
        }
    }
    async healthCheck() {
        try {
            if (!this.client) {
                await this.getClient();
            }
            await this.testConnection();
            return {
                status: 'healthy',
                details: {
                    connected: true,
                    catalog: environment_1.config.DATABRICKS_CATALOG,
                    schema: environment_1.config.DATABRICKS_SCHEMA,
                    timestamp: new Date().toISOString()
                }
            };
        }
        catch (error) {
            return {
                status: 'unhealthy',
                details: {
                    connected: false,
                    error: error.message,
                    timestamp: new Date().toISOString()
                }
            };
        }
    }
}
exports.databricksConnection = new DatabricksConnection();
process.on('SIGINT', async () => {
    logger_1.logger.info('Received SIGINT, closing database connection...');
    await exports.databricksConnection.close();
    process.exit(0);
});
process.on('SIGTERM', async () => {
    logger_1.logger.info('Received SIGTERM, closing database connection...');
    await exports.databricksConnection.close();
    process.exit(0);
});
//# sourceMappingURL=database.js.map