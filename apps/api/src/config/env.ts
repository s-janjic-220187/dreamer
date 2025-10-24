import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env file
config({ path: resolve(__dirname, '../.env') });

export const env = {
    // Server configuration
    PORT: process.env['PORT'] ? parseInt(process.env['PORT'], 10) : 3001,
    NODE_ENV: process.env['NODE_ENV'] || 'development',

    // Database configuration
    DATABASE_URL: process.env['DATABASE_URL'] || 'file:./dev.db',

    // AI service configuration
    OPENAI_API_KEY: process.env['OPENAI_API_KEY'] || null,

    // Feature flags
    AI_ENABLED: process.env['AI_ENABLED'] !== 'false', // Default to true
    ENHANCED_LOGGING: process.env['ENHANCED_LOGGING'] === 'true',
} as const;

export default env;