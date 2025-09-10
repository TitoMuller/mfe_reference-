"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DoraMetricsServer = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const environment_1 = require("@/config/environment");
const logger_1 = require("@/utils/logger");
const database_1 = require("@/config/database");
const error_middleware_1 = require("@/middleware/error-middleware");
const auth_middleware_1 = require("@/middleware/auth-middleware");
const dora_routes_1 = require("@/routes/dora-routes");
class DoraMetricsServer {
    app;
    server;
    constructor() {
        this.app = (0, express_1.default)();
        this.setupMiddleware();
        this.setupRoutes();
        this.setupErrorHandling();
    }
    setupMiddleware() {
        this.app.use((0, helmet_1.default)({
            contentSecurityPolicy: {
                directives: {
                    defaultSrc: ["'self'"],
                    styleSrc: ["'self'", "'unsafe-inline'"],
                    scriptSrc: ["'self'"],
                    imgSrc: ["'self'", "data:", "https:"],
                },
            },
        }));
        const corsOptions = {
            origin: environment_1.config.CORS_ORIGIN ? environment_1.config.CORS_ORIGIN.split(',') : true,
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization', environment_1.config.API_KEY_HEADER],
        };
        this.app.use((0, cors_1.default)(corsOptions));
        const limiter = (0, express_rate_limit_1.default)({
            windowMs: environment_1.config.RATE_LIMIT_WINDOW_MS,
            max: environment_1.config.RATE_LIMIT_MAX_REQUESTS,
            message: {
                error: true,
                message: 'Too many requests, please try again later.',
                timestamp: new Date().toISOString(),
            },
            standardHeaders: true,
            legacyHeaders: false,
        });
        this.app.use('/api/', limiter);
        this.app.use((0, compression_1.default)());
        this.app.use(express_1.default.json({ limit: '10mb' }));
        this.app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
        this.app.use((req, res, next) => {
            const startTime = Date.now();
            logger_1.logWithContext.info('HTTP Request', req.headers['x-organization-name'], {
                method: req.method,
                url: req.url,
                userAgent: req.get('User-Agent'),
                ip: req.ip,
            });
            res.on('finish', () => {
                const duration = Date.now() - startTime;
                logger_1.logWithContext.info('HTTP Response', req.headers['x-organization-name'], {
                    method: req.method,
                    url: req.url,
                    statusCode: res.statusCode,
                    duration: `${duration}ms`,
                });
            });
            next();
        });
    }
    setupRoutes() {
        this.app.get('/health', async (req, res) => {
            try {
                const dbHealth = await database_1.databricksConnection.healthCheck();
                const healthStatus = {
                    status: dbHealth.status === 'healthy' ? 'healthy' : 'degraded',
                    timestamp: new Date().toISOString(),
                    services: {
                        database: dbHealth,
                        api: {
                            status: 'healthy',
                            uptime_seconds: Math.floor(process.uptime()),
                        },
                    },
                };
                res.status(dbHealth.status === 'healthy' ? 200 : 503).json(healthStatus);
            }
            catch (error) {
                logger_1.logger.error('Health check failed', error);
                res.status(503).json({
                    status: 'unhealthy',
                    timestamp: new Date().toISOString(),
                    services: {
                        database: { status: 'unhealthy', details: error.message },
                        api: { status: 'healthy', uptime_seconds: Math.floor(process.uptime()) },
                    },
                });
            }
        });
        this.app.use('/api/v1/dora', auth_middleware_1.authMiddleware, dora_routes_1.doraRoutes);
        this.app.use('*', (req, res) => {
            res.status(404).json({
                error: true,
                message: `Route ${req.method} ${req.originalUrl} not found`,
                timestamp: new Date().toISOString(),
            });
        });
    }
    setupErrorHandling() {
        this.app.use(error_middleware_1.errorHandler);
        process.on('uncaughtException', (error) => {
            logger_1.logger.error('Uncaught Exception', error);
            this.gracefulShutdown('UNCAUGHT_EXCEPTION');
        });
        process.on('unhandledRejection', (reason, promise) => {
            logger_1.logger.error('Unhandled Rejection', new Error(String(reason)), undefined, { promise });
            this.gracefulShutdown('UNHANDLED_REJECTION');
        });
        process.on('SIGINT', () => this.gracefulShutdown('SIGINT'));
        process.on('SIGTERM', () => this.gracefulShutdown('SIGTERM'));
    }
    async start() {
        try {
            const dbHealth = await database_1.databricksConnection.healthCheck();
            if (dbHealth.status !== 'healthy') {
                logger_1.logger.warn('Database connection is unhealthy, but starting server anyway', dbHealth.details);
            }
            this.server = this.app.listen(environment_1.config.PORT, () => {
                logger_1.logger.info(`🚀 DORA Metrics API server started successfully`, undefined, {
                    port: environment_1.config.PORT,
                    environment: environment_1.config.NODE_ENV,
                    databricksConnected: dbHealth.status === 'healthy',
                });
            });
            this.server.on('error', (error) => {
                logger_1.logger.error('Server startup error', error);
                process.exit(1);
            });
        }
        catch (error) {
            logger_1.logger.error('Failed to start server', error);
            process.exit(1);
        }
    }
    async gracefulShutdown(signal) {
        logger_1.logger.info(`Received ${signal}, starting graceful shutdown...`);
        if (this.server) {
            this.server.close(async () => {
                logger_1.logger.info('HTTP server closed');
                try {
                    await database_1.databricksConnection.close();
                    logger_1.logger.info('Database connection closed');
                }
                catch (error) {
                    logger_1.logger.error('Error closing database connection', error);
                }
                logger_1.logger.info('Graceful shutdown completed');
                process.exit(0);
            });
            setTimeout(() => {
                logger_1.logger.error('Forced shutdown due to timeout');
                process.exit(1);
            }, 10000);
        }
        else {
            process.exit(0);
        }
    }
    getApp() {
        return this.app;
    }
}
exports.DoraMetricsServer = DoraMetricsServer;
if (require.main === module) {
    const server = new DoraMetricsServer();
    server.start().catch((error) => {
        logger_1.logger.error('Failed to start server', error);
        process.exit(1);
    });
}
exports.default = DoraMetricsServer;
//# sourceMappingURL=index.js.map