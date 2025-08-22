const express = require('express');
const router = express.Router();
const databaseManager = require('../config/database');
const ApiResponse = require('../utils/response');
const logger = require('../utils/logger');

/**
 * Health check endpoint
 * GET /api/health
 */
router.get('/', async (req, res) => {
  try {
    const startTime = Date.now();

    // Check database health
    const dbHealth = await databaseManager.healthCheck();

    // Check Redis health (if available)
    let redisHealth = { status: 'disabled' };
    if (req.app.locals.redis) {
      try {
        await req.app.locals.redis.ping();
        redisHealth = { status: 'healthy' };
      } catch (error) {
        redisHealth = { status: 'unhealthy', error: error.message };
      }
    }

    // Calculate response time
    const responseTime = Date.now() - startTime;

    // Overall health status
    const isHealthy =
      dbHealth.status === 'healthy' &&
      (redisHealth.status === 'healthy' || redisHealth.status === 'disabled');

    const healthData = {
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      responseTime: `${responseTime}ms`,
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0',
      services: {
        database: dbHealth,
        redis: redisHealth,
      },
      system: {
        memory: {
          used: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
          total: `${Math.round(
            process.memoryUsage().heapTotal / 1024 / 1024
          )}MB`,
        },
        cpu: process.cpuUsage(),
        platform: process.platform,
        nodeVersion: process.version,
      },
    };

    // Return appropriate status code
    const statusCode = isHealthy ? 200 : 503;

    return res.status(statusCode).json({
      success: isHealthy,
      data: healthData,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Health check failed:', error);

    return ApiResponse.serverError(res, 'Health check failed');
  }
});

/**
 * Detailed health check with dependencies
 * GET /api/health/detailed
 */
router.get('/detailed', async (req, res) => {
  try {
    const checks = [];

    // Database connectivity check
    try {
      const dbHealth = await databaseManager.healthCheck();
      checks.push({
        name: 'database',
        status: dbHealth.status,
        type: dbHealth.database,
        responseTime: Date.now(),
      });
    } catch (error) {
      checks.push({
        name: 'database',
        status: 'failed',
        error: error.message,
      });
    }

    // Redis connectivity check
    if (req.app.locals.redis) {
      try {
        const start = Date.now();
        await req.app.locals.redis.ping();
        checks.push({
          name: 'redis',
          status: 'healthy',
          responseTime: `${Date.now() - start}ms`,
        });
      } catch (error) {
        checks.push({
          name: 'redis',
          status: 'failed',
          error: error.message,
        });
      }
    } else {
      checks.push({
        name: 'redis',
        status: 'disabled',
      });
    }

    // External service checks (if any)
    // TODO: Add checks for external services like Kakao API, S3, etc.

    const allHealthy = checks.every(
      (check) => check.status === 'healthy' || check.status === 'disabled'
    );

    return ApiResponse.success(
      res,
      {
        overall: allHealthy ? 'healthy' : 'unhealthy',
        checks,
        timestamp: new Date().toISOString(),
      },
      'Detailed health check completed'
    );
  } catch (error) {
    logger.error('Detailed health check failed:', error);
    return ApiResponse.serverError(res, 'Detailed health check failed');
  }
});

/**
 * Readiness probe for Kubernetes
 * GET /api/health/ready
 */
router.get('/ready', async (req, res) => {
  try {
    // Check if all critical services are ready
    const dbHealth = await databaseManager.healthCheck();

    if (dbHealth.status !== 'healthy') {
      return res.status(503).json({
        ready: false,
        reason: 'Database not ready',
        timestamp: new Date().toISOString(),
      });
    }

    return res.status(200).json({
      ready: true,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Readiness check failed:', error);
    return res.status(503).json({
      ready: false,
      reason: 'Readiness check failed',
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * Liveness probe for Kubernetes
 * GET /api/health/live
 */
router.get('/live', (req, res) => {
  // Simple liveness check - if the server can respond, it's alive
  return res.status(200).json({
    alive: true,
    timestamp: new Date().toISOString(),
  });
});

/**
 * Performance metrics endpoint
 * GET /api/health/metrics
 */
router.get('/metrics', async (req, res) => {
  try {
    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();

    const metrics = {
      uptime: process.uptime(),
      memory: {
        rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`,
        heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
        heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
        external: `${Math.round(memoryUsage.external / 1024 / 1024)}MB`,
      },
      cpu: {
        user: cpuUsage.user,
        system: cpuUsage.system,
      },
      process: {
        pid: process.pid,
        version: process.version,
        platform: process.platform,
        arch: process.arch,
      },
      timestamp: new Date().toISOString(),
    };

    return ApiResponse.success(res, metrics, 'Performance metrics retrieved');
  } catch (error) {
    logger.error('Failed to get performance metrics:', error);
    return ApiResponse.serverError(res, 'Failed to get performance metrics');
  }
});

module.exports = router;
