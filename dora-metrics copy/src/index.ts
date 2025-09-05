// src/index.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';

import { config } from '@/config/environment';
import { logger, logWithContext } from '@/utils/logger';
import { databricksConnection } from '@/config/database';

// Middleware
import { errorHandler } from '@/middleware/error-middleware';
import { authMiddleware } from '@/middleware/auth-middleware';

// Routes
import { doraRoutes } from '@/routes/dora-routes';

/**
 * DORA Metrics API Server
 * Production-ready Express server with security, monitoring, and error handling
 */
class DoraMetricsServer {
  private app: express.Application;
  private server: any;

  constructor() {
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  /**
   * Configure middleware stack
   */
  private setupMiddleware(): void {
    // Security middleware
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
    }));

    // CORS configuration
    const corsOptions: cors.CorsOptions = {
      origin: config.CORS_ORIGIN ? config.CORS_ORIGIN.split(',') : true,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', config.API_KEY_HEADER],
    };
    this.app.use(cors(corsOptions));

    // Rate limiting
    const limiter = rateLimit({
      windowMs: config.RATE_LIMIT_WINDOW_MS,
      max: config.RATE_LIMIT_MAX_REQUESTS,
      message: {
        error: true,
        message: 'Too many requests, please try again later.',
        timestamp: new Date().toISOString(),
      },
      standardHeaders: true,
      legacyHeaders: false,
    });
    this.app.use('/api/', limiter);

    // Compression and parsing
    this.app.use(compression());
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Request logging middleware
    this.app.use((req, res, next) => {
      const startTime = Date.now();
      
      // Log request
      logWithContext.info('HTTP Request', req.headers['x-organization-name'] as string, {
        method: req.method,
        url: req.url,
        userAgent: req.get('User-Agent'),
        ip: req.ip,
      });

      // Log response when it finishes
      res.on('finish', () => {
        const duration = Date.now() - startTime;
        logWithContext.info('HTTP Response', req.headers['x-organization-name'] as string, {
          method: req.method,
          url: req.url,
          statusCode: res.statusCode,
          duration: `${duration}ms`,
        });
      });

      next();
    });
  }

  /**
   * Setup API routes
   */
  private setupRoutes(): void {
    // Health check endpoint (no auth required)
    this.app.get('/health', async (req, res) => {
      try {
        const dbHealth = await databricksConnection.healthCheck();
        const healthStatus = {
          status: dbHealth.status === 'healthy' ? 'healthy' : 'degraded',
          timestamp: new Date().toISOString(),
          services: {
            database: dbHealth,
            api: {
              status: 'healthy' as const,
              uptime_seconds: Math.floor(process.uptime()),
            },
          },
        };

        res.status(dbHealth.status === 'healthy' ? 200 : 503).json(healthStatus);
      } catch (error) {
        logger.error('Health check failed', error as Error);
        res.status(503).json({
          status: 'unhealthy',
          timestamp: new Date().toISOString(),
          services: {
            database: { status: 'unhealthy', details: (error as Error).message },
            api: { status: 'healthy', uptime_seconds: Math.floor(process.uptime()) },
          },
        });
      }
    });

    // API routes with authentication
    this.app.use('/api/v1/dora', authMiddleware, doraRoutes);

    // 404 handler for unknown routes
    this.app.use('*', (req, res) => {
      res.status(404).json({
        error: true,
        message: `Route ${req.method} ${req.originalUrl} not found`,
        timestamp: new Date().toISOString(),
      });
    });
  }

  /**
   * Setup error handling
   */
  private setupErrorHandling(): void {
    this.app.use(errorHandler);

    // Handle uncaught exceptions
    process.on('uncaughtException', (error: Error) => {
      logger.error('Uncaught Exception', error);
      this.gracefulShutdown('UNCAUGHT_EXCEPTION');
    });

    // Handle unhandled rejections
    process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
      logger.error('Unhandled Rejection', new Error(String(reason)), undefined, { promise });
      this.gracefulShutdown('UNHANDLED_REJECTION');
    });

    // Handle SIGINT and SIGTERM for graceful shutdown
    process.on('SIGINT', () => this.gracefulShutdown('SIGINT'));
    process.on('SIGTERM', () => this.gracefulShutdown('SIGTERM'));
  }

  /**
   * Start the server
   */
  async start(): Promise<void> {
    try {
      // Test database connection on startup
      const dbHealth = await databricksConnection.healthCheck();
      if (dbHealth.status !== 'healthy') {
        logger.warn('Database connection is unhealthy, but starting server anyway', dbHealth.details);
      }

      this.server = this.app.listen(config.PORT, () => {
        logger.info(`🚀 DORA Metrics API server started successfully`, undefined, {
          port: config.PORT,
          environment: config.NODE_ENV,
          databricksConnected: dbHealth.status === 'healthy',
        });
      });

      this.server.on('error', (error: Error) => {
        logger.error('Server startup error', error);
        process.exit(1);
      });
    } catch (error) {
      logger.error('Failed to start server', error as Error);
      process.exit(1);
    }
  }

  /**
   * Graceful shutdown handling
   */
  private async gracefulShutdown(signal: string): Promise<void> {
    logger.info(`Received ${signal}, starting graceful shutdown...`);

    if (this.server) {
      this.server.close(async () => {
        logger.info('HTTP server closed');
        
        try {
          await databricksConnection.close();
          logger.info('Database connection closed');
        } catch (error) {
          logger.error('Error closing database connection', error as Error);
        }
        
        logger.info('Graceful shutdown completed');
        process.exit(0);
      });

      // Force close after 10 seconds
      setTimeout(() => {
        logger.error('Forced shutdown due to timeout');
        process.exit(1);
      }, 10000);
    } else {
      process.exit(0);
    }
  }

  /**
   * Get Express app instance (useful for testing)
   */
  getApp(): express.Application {
    return this.app;
  }
}

// Start server if this file is run directly
if (require.main === module) {
  const server = new DoraMetricsServer();
  server.start().catch((error) => {
    logger.error('Failed to start server', error);
    process.exit(1);
  });
}

export { DoraMetricsServer };
export default DoraMetricsServer;