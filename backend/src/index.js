const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { createClient } = require('redis');
const winston = require('winston');

const config = require('./config');
const databaseManager = require('./config/database');
const logger = require('./utils/logger');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const { requestLogger } = require('./middleware/requestLogger');
const { validateJWT } = require('./middleware/auth');

// Import routes
const authRoutes = require('./routes/auth');
const questionRoutes = require('./routes/questions');
const answerRoutes = require('./routes/answers');
const healthRoutes = require('./routes/health');

class MundapdariServer {
  constructor() {
    this.app = express();
    this.server = null;
    this.redisClient = null;
  }

  async initialize() {
    try {
      // Initialize external services
      await this.initializeDatabase();
      await this.initializeRedis();

      // Setup Express middleware
      this.setupMiddleware();

      // Setup routes
      this.setupRoutes();

      // Setup error handling (must be last)
      this.setupErrorHandling();

      console.log('🚀 Mundapdari server initialized successfully');
    } catch (error) {
      console.error('❌ Server initialization failed:', error);
      throw error;
    }
  }

  async initializeDatabase() {
    try {
      await databaseManager.initialize();
    } catch (error) {
      console.error('❌ Database initialization failed:', error);
      throw error;
    }
  }

  async initializeRedis() {
    // Skip Redis initialization in development
    if (config.app.env === 'development') {
      console.log('📴 Redis disabled in development mode');
      this.redisClient = null;
      return;
    }

    try {
      this.redisClient = createClient(config.redis);

      this.redisClient.on('error', (err) => {
        console.error('❌ Redis Client Error:', err);
      });

      this.redisClient.on('connect', () => {
        console.log('✅ Redis connected successfully');
      });

      this.redisClient.on('disconnect', () => {
        console.log('📴 Redis disconnected');
      });

      await this.redisClient.connect();
    } catch (error) {
      console.warn(
        '⚠️ Redis connection failed, continuing without cache:',
        error.message
      );
      this.redisClient = null;
    }
  }

  setupMiddleware() {
    // Security middleware
    this.app.use(
      helmet({
        contentSecurityPolicy: {
          directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", 'data:', 'https:'],
          },
        },
        crossOriginEmbedderPolicy: false,
      })
    );

    // CORS configuration
    this.app.use(
      cors({
        origin: config.cors.origin,
        credentials: config.cors.credentials,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
      })
    );

    // Rate limiting
    const limiter = rateLimit({
      windowMs: config.rateLimit.windowMs,
      max: config.rateLimit.maxRequests,
      message: {
        error: 'Too many requests from this IP, please try again later.',
        retryAfter: Math.ceil(config.rateLimit.windowMs / 1000),
      },
      standardHeaders: true,
      legacyHeaders: false,
      // Skip rate limiting for health checks
      skip: (req) => req.path === '/api/health',
    });
    this.app.use('/api', limiter);

    // Request parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Request logging
    if (config.app.env !== 'test') {
      this.app.use(
        morgan('combined', {
          stream: { write: (message) => logger.info(message.trim()) },
        })
      );
    }

    // Custom request logger middleware
    this.app.use(requestLogger);

    // Make services available to routes
    this.app.locals.db = databaseManager;
    this.app.locals.redis = this.redisClient;
    this.app.locals.config = config;
  }

  setupRoutes() {
    // Health check endpoint (no auth required)
    this.app.use('/api/health', healthRoutes);

    // API routes with JWT validation for protected endpoints
    this.app.use('/api/auth', authRoutes);
    this.app.use('/api/questions', validateJWT, questionRoutes);
    this.app.use('/api/answers', validateJWT, answerRoutes);

    // Root endpoint
    this.app.get('/', (req, res) => {
      res.json({
        message: '🌉 Welcome to Mundapdari API',
        version: '1.0.0',
        environment: config.app.env,
        timestamp: new Date().toISOString(),
      });
    });

    // API documentation endpoint (development only)
    if (config.development.enableSwagger) {
      this.app.get('/api/docs', (req, res) => {
        res.json({
          message: 'API Documentation',
          endpoints: {
            auth: {
              'POST /api/auth/register': 'User registration',
              'POST /api/auth/invite': 'Create invitation link',
              'POST /api/auth/accept': 'Accept invitation',
              'GET /api/auth/verify': 'Verify JWT token',
              'POST /api/auth/refresh': 'Refresh JWT token',
            },
            questions: {
              'GET /api/questions/today': "Get today's question",
              'GET /api/questions/:id': 'Get specific question',
            },
            answers: {
              'POST /api/answers': 'Submit answer',
              'GET /api/answers/:questionId': 'Get answers for question',
              'PUT /api/answers/:answerId': 'Update answer',
              'POST /api/answers/:answerId/reaction': 'Add reaction to answer',
            },
            health: {
              'GET /api/health': 'Health check endpoint',
            },
          },
        });
      });
    }
  }

  setupErrorHandling() {
    // Handle 404 errors
    this.app.use('*', notFoundHandler);

    // Global error handler (must be last)
    this.app.use(errorHandler);

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      console.error('❌ Uncaught Exception:', error);
      logger.error('Uncaught Exception:', error);
      this.gracefulShutdown(1);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
      logger.error('Unhandled Rejection:', { reason, promise });
      this.gracefulShutdown(1);
    });

    // Handle process termination
    process.on('SIGTERM', () => {
      console.log('📴 SIGTERM received, shutting down gracefully');
      this.gracefulShutdown(0);
    });

    process.on('SIGINT', () => {
      console.log('📴 SIGINT received, shutting down gracefully');
      this.gracefulShutdown(0);
    });
  }

  async start() {
    try {
      await this.initialize();

      this.server = this.app.listen(config.app.port, () => {
        console.log(`
🌉 Mundapdari Backend Server Started
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔗 Environment: ${config.app.env}
🔗 Port: ${config.app.port}
🔗 URL: ${config.app.apiBaseUrl}
🔗 Database: ${databaseManager.usePostgres ? 'PostgreSQL' : 'SQLite'}
🔗 Cache: ${this.redisClient ? 'Redis' : 'Disabled'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        `);

        logger.info('Server started successfully', {
          port: config.app.port,
          environment: config.app.env,
          database: databaseManager.usePostgres ? 'PostgreSQL' : 'SQLite',
          cache: this.redisClient ? 'Redis' : 'Disabled',
        });
      });

      this.server.on('error', (error) => {
        if (error.code === 'EADDRINUSE') {
          console.error(`❌ Port ${config.app.port} is already in use`);
        } else {
          console.error('❌ Server error:', error);
        }
        process.exit(1);
      });
    } catch (error) {
      console.error('❌ Failed to start server:', error);
      process.exit(1);
    }
  }

  async gracefulShutdown(exitCode = 0) {
    console.log('📴 Starting graceful shutdown...');

    // Stop accepting new connections
    if (this.server) {
      this.server.close(() => {
        console.log('📴 HTTP server closed');
      });
    }

    try {
      // Close database connections
      await databaseManager.close();

      // Close Redis connection
      if (this.redisClient) {
        await this.redisClient.quit();
        console.log('📴 Redis connection closed');
      }

      console.log('✅ Graceful shutdown completed');
      process.exit(exitCode);
    } catch (error) {
      console.error('❌ Error during graceful shutdown:', error);
      process.exit(1);
    }
  }
}

// Create and start server instance
const server = new MundapdariServer();

// Start server only if this file is run directly
if (require.main === module) {
  server.start().catch((error) => {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  });
}

module.exports = server;
