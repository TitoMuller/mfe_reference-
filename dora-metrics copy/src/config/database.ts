// src/config/database.ts
import { DBSQLClient } from '@databricks/sql';
import { config } from './environment';
import { logger, logWithContext } from '@/utils/logger';

/**
 * Databricks connection configuration and management
 * Handles connection pooling, retries, and graceful shutdown
 */
class DatabricksConnection {
  private client: DBSQLClient | null = null;
  private isConnecting = false;

  /**
   * Get or create Databricks client with connection pooling
   */
  async getClient(): Promise<DBSQLClient> {
    if (this.client) {
      return this.client;
    }

    if (this.isConnecting) {
      // Wait for existing connection attempt
      return new Promise((resolve, reject) => {
        const checkConnection = () => {
          if (this.client) {
            resolve(this.client);
          } else if (!this.isConnecting) {
            reject(new Error('Connection attempt failed'));
          } else {
            setTimeout(checkConnection, 100);
          }
        };
        checkConnection();
      });
    }

    return this.connect();
  }

  /**
   * Establish connection to Databricks
   */
  private async connect(): Promise<DBSQLClient> {
    this.isConnecting = true;
    
    try {
      logger.info('Connecting to Databricks...', {
        hostname: config.DATABRICKS_SERVER_HOSTNAME,
        httpPath: config.DATABRICKS_HTTP_PATH,
        catalog: config.DATABRICKS_CATALOG,
        schema: config.DATABRICKS_SCHEMA
      });

      this.client = new DBSQLClient();
      
      await this.client.connect({
        host: config.DATABRICKS_SERVER_HOSTNAME,
        path: config.DATABRICKS_HTTP_PATH,
        token: config.DATABRICKS_TOKEN,
      });

      logger.info('Successfully connected to Databricks');
      
      // Test the connection with a simple query
      await this.testConnection();
      
      return this.client;
    } catch (error) {
      this.client = null;
      logger.error('Failed to connect to Databricks', error as Error);
      throw new Error(`Databricks connection failed: ${(error as Error).message}`);
    } finally {
      this.isConnecting = false;
    }
  }

  /**
   * Test the database connection
   */
  private async testConnection(): Promise<void> {
    if (!this.client) {
      throw new Error('Client not initialized');
    }

    try {
      const session = await this.client.openSession();
      const operation = await session.executeStatement(
        `USE CATALOG ${config.DATABRICKS_CATALOG}`
      );
      
      await operation.fetchAll();
      await operation.close();
      
      // Test schema access
      const schemaOperation = await session.executeStatement(
        `USE SCHEMA ${config.DATABRICKS_SCHEMA}`
      );
      
      await schemaOperation.fetchAll();
      await schemaOperation.close();
      
      // Count tables in schema
      const countOperation = await session.executeStatement(
        `SHOW TABLES IN ${config.DATABRICKS_CATALOG}.${config.DATABRICKS_SCHEMA}`
      );
      
      const result = await countOperation.fetchAll();
      await countOperation.close();
      await session.close();
      
      const tableCount = result.length || 0;
      logger.info(`Connection test successful. Found ${tableCount} tables in ${config.DATABRICKS_CATALOG}.${config.DATABRICKS_SCHEMA}`);
      
      if (tableCount === 0) {
        logger.warn(`No tables found in ${config.DATABRICKS_CATALOG}.${config.DATABRICKS_SCHEMA}. Please verify your schema configuration.`);
      }
    } catch (error) {
      logger.error('Connection test failed', error as Error);
      throw error;
    }
  }

  /**
   * Execute a query with error handling and logging
   */
  async executeQuery<T = any>(
    sql: string, 
    organizationName?: string,
    params?: Record<string, any>
  ): Promise<T[]> {
    const client = await this.getClient();
    let session;
    let operation;

    try {
      logWithContext.debug('Executing query', organizationName, { 
        sql: sql.slice(0, 200) + (sql.length > 200 ? '...' : ''),
        params 
      });

      session = await client.openSession();
      
      // Set catalog and schema for this session
      await session.executeStatement(`USE CATALOG ${config.DATABRICKS_CATALOG}`);
      await session.executeStatement(`USE SCHEMA ${config.DATABRICKS_SCHEMA}`);
      
      // Replace parameters in SQL (simple parameter substitution)
      let finalSql = sql;
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          const placeholder = `\${${key}}`;
          finalSql = finalSql.replace(
            new RegExp(`\\$\\{${key}\\}`, 'g'), 
            typeof value === 'string' ? `'${value}'` : String(value)
          );
        });
      }

      operation = await session.executeStatement(finalSql);
      const results = await operation.fetchAll();
      
      logWithContext.info(`Query executed successfully`, organizationName, {
        rowCount: results.length,
      });

      return results as T[];
    } catch (error) {
      logWithContext.error('Query execution failed', error as Error, organizationName, { 
        sql: sql.slice(0, 200) + (sql.length > 200 ? '...' : ''),
        params 
      });
      throw error;
    } finally {
      try {
        if (operation) await operation.close();
        if (session) await session.close();
      } catch (closeError) {
        logger.warn('Error closing database resources', closeError as Error);
      }
    }
  }

  /**
   * Close the connection gracefully
   */
  async close(): Promise<void> {
    if (this.client) {
      try {
        await this.client.close();
        logger.info('Databricks connection closed successfully');
      } catch (error) {
        logger.error('Error closing Databricks connection', error as Error);
      } finally {
        this.client = null;
      }
    }
  }

  /**
   * Health check for the database connection
   */
  async healthCheck(): Promise<{ status: 'healthy' | 'unhealthy'; details: any }> {
    try {
      if (!this.client) {
        await this.getClient();
      }
      
      await this.testConnection();
      
      return {
        status: 'healthy',
        details: {
          connected: true,
          catalog: config.DATABRICKS_CATALOG,
          schema: config.DATABRICKS_SCHEMA,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        details: {
          connected: false,
          error: (error as Error).message,
          timestamp: new Date().toISOString()
        }
      };
    }
  }
}

// Export singleton instance
export const databricksConnection = new DatabricksConnection();

// Graceful shutdown handling
process.on('SIGINT', async () => {
  logger.info('Received SIGINT, closing database connection...');
  await databricksConnection.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('Received SIGTERM, closing database connection...');
  await databricksConnection.close();
  process.exit(0);
});