import winston from 'winston';
import { config } from '@/config/environment';

/**
 * Centralized logging configuration using Winston
 * Provides structured logging with different levels for development and production
 */
const logger = winston.createLogger({
  level: config.LOG_LEVEL,
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.errors({ stack: true }),
    winston.format.json(),
    winston.format.colorize({ all: config.NODE_ENV === 'development' })
  ),
  defaultMeta: { 
    service: 'dora-metrics-api',
    environment: config.NODE_ENV 
  },
  transports: [
    // Console transport for all environments
    new winston.transports.Console({
      format: config.NODE_ENV === 'development' 
        ? winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          )
        : winston.format.json()
    })
  ],
});

// Add file transport in production
if (config.NODE_ENV === 'production') {
  logger.add(new winston.transports.File({
    filename: 'logs/error.log',
    level: 'error',
    maxsize: 10485760, // 10MB
    maxFiles: 5
  }));
  
  logger.add(new winston.transports.File({
    filename: 'logs/combined.log',
    maxsize: 10485760, // 10MB
    maxFiles: 5
  }));
}

/**
 * Logger methods with organization context
 * This helps track which organization's data is being accessed
 */
export const logWithContext = {
  info: (message: string, organizationName?: string, meta?: any) => {
    logger.info(message, { 
      organizationName, 
      ...meta 
    });
  },
  
  error: (message: string, error?: Error, organizationName?: string, meta?: any) => {
    logger.error(message, { 
      error: error?.stack || error?.message,
      organizationName,
      ...meta 
    });
  },
  
  warn: (message: string, organizationName?: string, meta?: any) => {
    logger.warn(message, { 
      organizationName,
      ...meta 
    });
  },
  
  debug: (message: string, organizationName?: string, meta?: any) => {
    logger.debug(message, { 
      organizationName,
      ...meta 
    });
  }
};

export { logger };
export default logger;