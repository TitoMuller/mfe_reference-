"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = exports.logWithContext = void 0;
const winston_1 = __importDefault(require("winston"));
const environment_1 = require("@/config/environment");
const logger = winston_1.default.createLogger({
    level: environment_1.config.LOG_LEVEL,
    format: winston_1.default.format.combine(winston_1.default.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss'
    }), winston_1.default.format.errors({ stack: true }), winston_1.default.format.json(), winston_1.default.format.colorize({ all: environment_1.config.NODE_ENV === 'development' })),
    defaultMeta: {
        service: 'dora-metrics-api',
        environment: environment_1.config.NODE_ENV
    },
    transports: [
        new winston_1.default.transports.Console({
            format: environment_1.config.NODE_ENV === 'development'
                ? winston_1.default.format.combine(winston_1.default.format.colorize(), winston_1.default.format.simple())
                : winston_1.default.format.json()
        })
    ],
});
exports.logger = logger;
if (environment_1.config.NODE_ENV === 'production') {
    logger.add(new winston_1.default.transports.File({
        filename: 'logs/error.log',
        level: 'error',
        maxsize: 10485760,
        maxFiles: 5
    }));
    logger.add(new winston_1.default.transports.File({
        filename: 'logs/combined.log',
        maxsize: 10485760,
        maxFiles: 5
    }));
}
exports.logWithContext = {
    info: (message, organizationName, meta) => {
        logger.info(message, {
            organizationName,
            ...meta
        });
    },
    error: (message, error, organizationName, meta) => {
        logger.error(message, {
            error: error?.stack || error?.message,
            organizationName,
            ...meta
        });
    },
    warn: (message, organizationName, meta) => {
        logger.warn(message, {
            organizationName,
            ...meta
        });
    },
    debug: (message, organizationName, meta) => {
        logger.debug(message, {
            organizationName,
            ...meta
        });
    }
};
exports.default = logger;
//# sourceMappingURL=logger.js.map