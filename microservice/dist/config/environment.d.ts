import { z } from 'zod';
declare const envSchema: z.ZodObject<{
    NODE_ENV: z.ZodDefault<z.ZodEnum<["development", "production", "test"]>>;
    PORT: z.ZodDefault<z.ZodEffects<z.ZodString, number, string>>;
    DATABRICKS_SERVER_HOSTNAME: z.ZodString;
    DATABRICKS_HTTP_PATH: z.ZodString;
    DATABRICKS_TOKEN: z.ZodString;
    DATABRICKS_CATALOG: z.ZodDefault<z.ZodString>;
    DATABRICKS_SCHEMA: z.ZodDefault<z.ZodString>;
    CORS_ORIGIN: z.ZodOptional<z.ZodString>;
    API_KEY_HEADER: z.ZodDefault<z.ZodString>;
    RATE_LIMIT_WINDOW_MS: z.ZodDefault<z.ZodEffects<z.ZodString, number, string>>;
    RATE_LIMIT_MAX_REQUESTS: z.ZodDefault<z.ZodEffects<z.ZodString, number, string>>;
    LOG_LEVEL: z.ZodDefault<z.ZodEnum<["error", "warn", "info", "debug"]>>;
    JWT_SECRET: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    NODE_ENV: "development" | "production" | "test";
    PORT: number;
    DATABRICKS_SERVER_HOSTNAME: string;
    DATABRICKS_HTTP_PATH: string;
    DATABRICKS_TOKEN: string;
    DATABRICKS_CATALOG: string;
    DATABRICKS_SCHEMA: string;
    API_KEY_HEADER: string;
    RATE_LIMIT_WINDOW_MS: number;
    RATE_LIMIT_MAX_REQUESTS: number;
    LOG_LEVEL: "error" | "warn" | "info" | "debug";
    CORS_ORIGIN?: string | undefined;
    JWT_SECRET?: string | undefined;
}, {
    DATABRICKS_SERVER_HOSTNAME: string;
    DATABRICKS_HTTP_PATH: string;
    DATABRICKS_TOKEN: string;
    NODE_ENV?: "development" | "production" | "test" | undefined;
    PORT?: string | undefined;
    DATABRICKS_CATALOG?: string | undefined;
    DATABRICKS_SCHEMA?: string | undefined;
    CORS_ORIGIN?: string | undefined;
    API_KEY_HEADER?: string | undefined;
    RATE_LIMIT_WINDOW_MS?: string | undefined;
    RATE_LIMIT_MAX_REQUESTS?: string | undefined;
    LOG_LEVEL?: "error" | "warn" | "info" | "debug" | undefined;
    JWT_SECRET?: string | undefined;
}>;
type Environment = z.infer<typeof envSchema>;
declare let config: Environment;
export { config };
export type { Environment };
//# sourceMappingURL=environment.d.ts.map