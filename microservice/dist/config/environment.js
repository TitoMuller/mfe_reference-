"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const zod_1 = require("zod");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const envSchema = zod_1.z.object({
    NODE_ENV: zod_1.z.enum(['development', 'production', 'test']).default('development'),
    PORT: zod_1.z.string().transform((val) => parseInt(val, 10)).default('3001'),
    DATABRICKS_SERVER_HOSTNAME: zod_1.z.string().min(1, 'Databricks server hostname is required'),
    DATABRICKS_HTTP_PATH: zod_1.z.string().min(1, 'Databricks HTTP path is required'),
    DATABRICKS_TOKEN: zod_1.z.string().min(1, 'Databricks access token is required'),
    DATABRICKS_CATALOG: zod_1.z.string().default('zephyr_catalog'),
    DATABRICKS_SCHEMA: zod_1.z.string().default('dora_gold'),
    CORS_ORIGIN: zod_1.z.string().optional(),
    API_KEY_HEADER: zod_1.z.string().default('x-api-key'),
    RATE_LIMIT_WINDOW_MS: zod_1.z.string().transform((val) => parseInt(val, 10)).default('900000'),
    RATE_LIMIT_MAX_REQUESTS: zod_1.z.string().transform((val) => parseInt(val, 10)).default('100'),
    LOG_LEVEL: zod_1.z.enum(['error', 'warn', 'info', 'debug']).default('info'),
    JWT_SECRET: zod_1.z.string().optional(),
});
let config;
try {
    exports.config = config = envSchema.parse(process.env);
}
catch (error) {
    if (error instanceof zod_1.z.ZodError) {
        console.error('Environment validation failed:');
        error.errors.forEach((err) => {
            console.error(`- ${err.path.join('.')}: ${err.message}`);
        });
        process.exit(1);
    }
    throw error;
}
//# sourceMappingURL=environment.js.map