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
  MERCHANT_UPI_ID: z.string().min(3, 'MERCHANT_UPI_ID is required (e.g. yourname@okhdfcbank or merchant@upi)'),
  MERCHANT_NAME: z.string().default('Parth Arora'),
  UNIQUE_AMOUNT_MATCHING: z
    .string()
    .transform((val) => val === 'true' || val === '1')
    .default('true'),

  // Database URL (PostgreSQL / Supabase)
  DATABASE_URL: z.string().optional(),

  // Admin authentication
  ADMIN_SECRET: z.string().min(16, 'ADMIN_SECRET must be at least 16 characters for security'),
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
  EMAIL_PROVIDER: z.enum(['console', 'resend', 'ses', 'gmail']).default('gmail'),
  GMAIL_USER: z.string().default('parthxcore@gmail.com'),
  GMAIL_APP_PASSWORD: z.string().default('jdhlpwtmetsgeuao'),
  GMAIL_AUTO_RESPONDER: z
    .string()
    .transform((val) => val === 'true' || val === '1')
    .default('true'),
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().default('Parth Arora <parthxcore@gmail.com>'),
  ADMIN_ALERT_EMAIL: z.string().email().optional(),

  // Order settings
  ORDER_EXPIRY_MINUTES: z.coerce.number().default(30),
  DOWNLOAD_TOKEN_EXPIRY_MINUTES: z.coerce.number().default(15),
  MAX_DOWNLOADS_PER_TOKEN: z.coerce.number().default(3),
  OTP_EXPIRY_MINUTES: z.coerce.number().default(10),
});

export type EnvConfig = z.infer<typeof envSchema>;

function parseEnv(): EnvConfig {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error('❌ Environment validation failed:');
    console.error(JSON.stringify(result.error.format(), null, 2));
    // For dev ease, use safe defaults if MERCHANT_UPI_ID is missing in dev
    if (process.env.NODE_ENV !== 'production' && !process.env.MERCHANT_UPI_ID) {
      console.warn('⚠️  MERCHANT_UPI_ID not set. Using test mode UPI ID: test-merchant@upi. SET THIS IN .env FOR PRODUCTION!');
      process.env.MERCHANT_UPI_ID = 'test-merchant@upi';
      process.env.ADMIN_SECRET = process.env.ADMIN_SECRET || 'dev-admin-secret-key-32-chars-long!';
      return envSchema.parse(process.env);
    }
    throw new Error('Invalid environment configuration');
  }
  return result.data;
}

export const env = parseEnv();
