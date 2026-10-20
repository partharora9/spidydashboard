import dotenv from 'dotenv';
import { z } from 'zod';
import path from 'path';

// Load .env file from server root or project root
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'server/.env') });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(4000),
  CLIENT_ORIGIN: z.string().default('http://localhost:5173'),

  // Payment configuration (SERVER ONLY - NEVER EXPOSED)
  MERCHANT_UPI_ID: z
    .string()
    .optional()
    .transform((val) => val || '8700383626@axl'),
  MERCHANT_NAME: z
    .string()
    .optional()
    .transform((val) => val || 'Parth Arora'),
  UNIQUE_AMOUNT_MATCHING: z
    .string()
    .default('true')
    .transform((val) => val === 'true' || val === '1'),

  // Database URL (PostgreSQL / Supabase)
  DATABASE_URL: z.string().optional(),

  // Admin authentication
  ADMIN_SECRET: z
    .string()
    .optional()
    .transform((val) => (val && val.length >= 16 ? val : 'dev-admin-secret-key-32-chars-long!')),
  ADMIN_SESSION_SECRET: z.string().min(16, 'ADMIN_SESSION_SECRET must be at least 16 characters').default('super-secret-session-key-32chars-min!'),
  ADMIN_ALLOWED_IPS: z.string().optional(), // Comma-separated list of allowed IPs (optional)

  // Turnstile Cloudflare (Optional in dev, recommended in prod)
  TURNSTILE_SECRET_KEY: z.string().optional(),

  // Storage (Cloudflare R2 or AWS S3)
  STORAGE_PROVIDER: z.enum(['local', 's3', 'r2']).default('local'),
  S3_ENDPOINT: z.string().optional(),
  S3_BUCKET_NAME: z.string().default('spidydashboard-releases'),
  S3_ACCESS_KEY_ID: z.string().optional(),
  S3_SECRET_ACCESS_KEY: z.string().optional(),
  S3_REGION: z.string().default('auto'),

  // Transactional Email (Gmail, Resend, SES, or console logger)
  EMAIL_PROVIDER: z.enum(['console', 'resend', 'ses', 'gmail']).default('resend'),
  GMAIL_USER: z.string().optional(),
  GMAIL_APP_PASSWORD: z.string().optional(),
  GMAIL_AUTO_RESPONDER: z
    .string()
    .default('false')
    .transform((val) => val === 'true' || val === '1'),
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().default('SpidyDashboard <hello@spidydashboard.com>'),
  ADMIN_ALERT_EMAIL: z.string().email().optional(),

  // Order settings
  ORDER_EXPIRY_MINUTES: z.coerce.number().default(30),
  DOWNLOAD_TOKEN_EXPIRY_MINUTES: z.coerce.number().default(2880), // 48 hours
  MAX_DOWNLOADS_PER_TOKEN: z.coerce.number().default(3),
  OTP_EXPIRY_MINUTES: z.coerce.number().default(10),
});

export type EnvConfig = z.infer<typeof envSchema>;

function parseEnv(): EnvConfig {
  const cleanEnv: Record<string, any> = {};
  for (const [key, val] of Object.entries(process.env)) {
    if (val !== undefined && val !== '') {
      cleanEnv[key] = val;
    }
  }

  const result = envSchema.safeParse(cleanEnv);
  if (result.success) {
    return result.data;
  }

  console.warn('⚠️ Environment validation warning: using safe fallback defaults.');
  return {
    NODE_ENV: (process.env.NODE_ENV as any) || 'production',
    PORT: Number(process.env.PORT) || 4000,
    CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
    MERCHANT_UPI_ID: process.env.MERCHANT_UPI_ID || '8700383626@axl',
    MERCHANT_NAME: process.env.MERCHANT_NAME || 'Parth Arora',
    UNIQUE_AMOUNT_MATCHING: false,
    ADMIN_SECRET: process.env.ADMIN_SECRET || 'dev-admin-secret-key-32-chars-long!',
    ADMIN_SESSION_SECRET: process.env.ADMIN_SESSION_SECRET || 'super-secret-session-key-32chars-min!',
    STORAGE_PROVIDER: 'local',
    S3_BUCKET_NAME: process.env.S3_BUCKET_NAME || 'spidydashboard-releases',
    S3_REGION: process.env.S3_REGION || 'auto',
    EMAIL_PROVIDER: 'resend',
    EMAIL_FROM: process.env.EMAIL_FROM || 'SpidyDashboard <hello@spidydashboard.com>',
    ORDER_EXPIRY_MINUTES: Number(process.env.ORDER_EXPIRY_MINUTES) || 30,
    DOWNLOAD_TOKEN_EXPIRY_MINUTES: Number(process.env.DOWNLOAD_TOKEN_EXPIRY_MINUTES) || 2880,
    MAX_DOWNLOADS_PER_TOKEN: Number(process.env.MAX_DOWNLOADS_PER_TOKEN) || 3,
    OTP_EXPIRY_MINUTES: Number(process.env.OTP_EXPIRY_MINUTES) || 10,
    GMAIL_AUTO_RESPONDER: false,
    ...cleanEnv,
  } as unknown as EnvConfig;
}

export const env = parseEnv();
