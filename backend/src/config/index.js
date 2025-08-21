const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from the project root directory
dotenv.config({ path: path.join(__dirname, '../../../.env') });

const config = {
  app: {
    env: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT, 10) || 3000,
    apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:3000',
  },

  database: {
    // PostgreSQL configuration (production)
    postgres: {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT, 10) || 5432,
      database: process.env.DB_NAME || 'mundapdari',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
      ssl: process.env.DB_SSL === 'true',
      max: 20, // Maximum number of clients in the pool
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    },
    
    // SQLite configuration (development)
    sqlite: {
      filename: process.env.SQLITE_PATH || path.join(__dirname, '../../database/mundapdari.db'),
    },
  },

  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    password: process.env.REDIS_PASSWORD || '',
    db: parseInt(process.env.REDIS_DB, 10) || 0,
    retryDelayOnFailover: 100,
    enableReadyCheck: false,
    maxRetriesPerRequest: null,
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'fallback-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  encryption: {
    key: process.env.ENCRYPTION_KEY || '0123456789abcdef0123456789abcdef', // 32 char hex
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000, // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100,
  },

  cors: {
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'],
    credentials: true,
  },

  external: {
    kakao: {
      apiUrl: process.env.KAKAO_API_URL || 'https://kapi.kakao.com',
      appKey: process.env.KAKAO_APP_KEY,
      appSecret: process.env.KAKAO_APP_SECRET,
    },
    aws: {
      region: process.env.AWS_REGION || 'ap-northeast-2',
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      s3Bucket: process.env.AWS_S3_BUCKET || 'mundapdari-images',
    },
  },

  monitoring: {
    sentryDsn: process.env.SENTRY_DSN,
    logLevel: process.env.LOG_LEVEL || 'info',
  },

  notifications: {
    queueRedisUrl: process.env.NOTIFICATION_QUEUE_REDIS_URL || 'redis://localhost:6379',
    retryAttempts: parseInt(process.env.MESSAGE_RETRY_ATTEMPTS, 10) || 3,
    retryDelay: parseInt(process.env.MESSAGE_RETRY_DELAY, 10) || 5000,
  },

  development: {
    enableSwagger: process.env.ENABLE_SWAGGER === 'true',
    enableCorsDebug: process.env.ENABLE_CORS_DEBUG === 'true',
    enableSqlLogging: process.env.ENABLE_SQL_LOGGING === 'true',
  },
};

// Validation for required environment variables in production
if (config.app.env === 'production') {
  const requiredEnvVars = [
    'JWT_SECRET',
    'JWT_REFRESH_SECRET', 
    'ENCRYPTION_KEY',
    'DB_HOST',
    'DB_NAME',
    'DB_USER',
    'DB_PASSWORD',
  ];

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }
}

module.exports = config;