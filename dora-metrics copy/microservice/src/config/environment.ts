import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Environment variables schema validation using Zod
 * This ensures all required environment variables are present and valid
 */
const envSchema = z.object({
  // Server Configuration
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform((val) => parseInt(val, 10)).default('3001'),
  
  // Databricks Configuration (using official environment variable names)
  DATABRICKS_SERVER_HOSTNAME: z.string().min(1, 'Databricks server hostname is required'),
  DATABRICKS_HTTP_PATH: z.string().min(1, 'Databricks HTTP path is required'),
  DATABRICKS_TOKEN: z.string().min(1, 'Databricks access token is required'),
  DATABRICKS_CATALOG: z.string().default('zephyr_catalog'),
  DATABRICKS_SCHEMA: z.string().default('dora_gold'),
  
  // Security Configuration
  CORS_ORIGIN: z.string().optional(),
  API_KEY_HEADER: z.string().default('x-api-key'),
  RATE_LIMIT_WINDOW_MS: z.string().transform((val) => parseInt(val, 10)).default('900000'), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: z.string().transform((val) => parseInt(val, 10)).default('100'),
  
  // Logging Configuration
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  
  // Organization-level security (following your existing pattern)
  JWT_SECRET: z.string().optional(), // For validating Zephyr JWT tokens if needed
});

type Environment = z.infer<typeof envSchema>;

let config: Environment;

try {
  config = envSchema.parse(process.env);
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error('Environment validation failed:');
    error.errors.forEach((err) => {
      console.error(`- ${err.path.join('.')}: ${err.message}`);
    });
    process.exit(1);
  }
  throw error;
}

export { config };
export type { Environment };