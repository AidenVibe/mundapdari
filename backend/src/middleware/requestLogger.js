const logger = require('../utils/logger');
const { v4: uuidv4 } = require('uuid');

/**
 * Request logging middleware
 * Logs requests with unique request IDs and timing information
 */
const requestLogger = (req, res, next) => {
  // Generate unique request ID
  req.requestId = uuidv4();
  
  // Add request ID to response headers for debugging
  res.setHeader('X-Request-ID', req.requestId);
  
  // Record start time
  req.startTime = Date.now();
  
  // Extract useful request information
  const requestInfo = {
    requestId: req.requestId,
    method: req.method,
    url: req.url,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
    contentType: req.get('Content-Type'),
    contentLength: req.get('Content-Length'),
    timestamp: new Date().toISOString(),
  };

  // Log request start (for debugging)
  if (process.env.ENABLE_REQUEST_LOGGING === 'true') {
    logger.debug('Request started:', requestInfo);
  }

  // Override res.json to log response
  const originalJson = res.json;
  res.json = function(data) {
    // Calculate response time
    const responseTime = Date.now() - req.startTime;
    
    // Log response information
    const responseInfo = {
      requestId: req.requestId,
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`,
      contentLength: JSON.stringify(data).length,
      userId: req.user?.id,
      timestamp: new Date().toISOString(),
    };

    // Determine log level based on status code
    let logLevel = 'info';
    if (res.statusCode >= 400 && res.statusCode < 500) {
      logLevel = 'warn';
    } else if (res.statusCode >= 500) {
      logLevel = 'error';
    }

    // Log response
    logger[logLevel]('Request completed:', responseInfo);

    // Performance warning for slow requests
    if (responseTime > 5000) { // 5 seconds
      logger.warn('Slow request detected:', {
        ...responseInfo,
        performance: 'SLOW',
      });
    }

    // Call original json method
    return originalJson.call(this, data);
  };

  // Override res.send to log non-JSON responses
  const originalSend = res.send;
  res.send = function(data) {
    if (!res.headersSent && res.statusCode !== 304) {
      const responseTime = Date.now() - req.startTime;
      
      const responseInfo = {
        requestId: req.requestId,
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        responseTime: `${responseTime}ms`,
        userId: req.user?.id,
        timestamp: new Date().toISOString(),
      };

      let logLevel = 'info';
      if (res.statusCode >= 400 && res.statusCode < 500) {
        logLevel = 'warn';
      } else if (res.statusCode >= 500) {
        logLevel = 'error';
      }

      logger[logLevel]('Request completed:', responseInfo);
    }

    return originalSend.call(this, data);
  };

  // Handle request body logging for debugging (be careful with sensitive data)
  if (process.env.ENABLE_BODY_LOGGING === 'true' && req.method !== 'GET') {
    // Only log non-sensitive endpoints
    const sensitiveEndpoints = ['/auth/register', '/auth/login', '/auth/invite'];
    const isSensitive = sensitiveEndpoints.some(endpoint => req.url.includes(endpoint));
    
    if (!isSensitive && req.body) {
      logger.debug('Request body:', {
        requestId: req.requestId,
        body: req.body,
      });
    }
  }

  next();
};

/**
 * API metrics collection middleware
 * Collects metrics for monitoring and analytics
 */
const metricsCollector = (req, res, next) => {
  // Skip metrics for health checks and static files
  if (req.url === '/health' || req.url === '/api/health' || req.url.includes('static')) {
    return next();
  }

  const startTime = Date.now();

  // Override response methods to collect metrics
  const originalEnd = res.end;
  res.end = function(...args) {
    const responseTime = Date.now() - startTime;
    
    // Collect metrics
    const metrics = {
      timestamp: new Date().toISOString(),
      method: req.method,
      route: req.route?.path || req.url,
      statusCode: res.statusCode,
      responseTime,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      userId: req.user?.id,
      requestId: req.requestId,
    };

    // Log metrics for analysis
    logger.info('API Metrics:', metrics);

    // TODO: Send metrics to monitoring service (e.g., CloudWatch, Grafana)
    // metricsService.record(metrics);

    originalEnd.apply(this, args);
  };

  next();
};

/**
 * Request sanitization middleware
 * Sanitizes request data to prevent XSS and injection attacks
 */
const sanitizeRequest = (req, res, next) => {
  if (req.body) {
    sanitizeObject(req.body);
  }
  
  if (req.query) {
    sanitizeObject(req.query);
  }
  
  if (req.params) {
    sanitizeObject(req.params);
  }

  next();
};

/**
 * Recursively sanitize object properties
 * @param {object} obj - Object to sanitize
 */
function sanitizeObject(obj) {
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      if (typeof obj[key] === 'string') {
        // Basic XSS prevention
        obj[key] = obj[key]
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
          .replace(/javascript:/gi, '') // Remove javascript: protocol
          .replace(/on\w+\s*=/gi, ''); // Remove event handlers
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitizeObject(obj[key]);
      }
    }
  }
}

/**
 * Rate limiting information middleware
 * Adds rate limiting information to response headers
 */
const rateLimitInfo = (req, res, next) => {
  // This would typically integrate with your rate limiting middleware
  // For now, we'll add basic headers
  
  const limit = 100; // requests per window
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const remaining = 99; // would be calculated based on actual usage
  const resetTime = Math.ceil(Date.now() / windowMs) * windowMs;

  res.setHeader('X-RateLimit-Limit', limit);
  res.setHeader('X-RateLimit-Remaining', remaining);
  res.setHeader('X-RateLimit-Reset', resetTime);

  next();
};

/**
 * Security headers middleware
 * Adds security-related headers to responses
 */
const securityHeaders = (req, res, next) => {
  // Request ID for tracking
  res.setHeader('X-Request-ID', req.requestId);
  
  // API version
  res.setHeader('X-API-Version', '1.0.0');
  
  // Prevent caching of sensitive endpoints
  if (req.url.includes('/auth/') || req.url.includes('/api/auth/')) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }

  next();
};

/**
 * Request timeout middleware
 * Sets a timeout for requests to prevent hanging
 */
const requestTimeout = (timeoutMs = 30000) => {
  return (req, res, next) => {
    // Set request timeout
    req.setTimeout(timeoutMs, () => {
      logger.warn('Request timeout:', {
        requestId: req.requestId,
        method: req.method,
        url: req.url,
        timeout: timeoutMs,
      });

      if (!res.headersSent) {
        res.status(408).json({
          success: false,
          message: 'Request timeout',
          timestamp: new Date().toISOString(),
        });
      }
    });

    // Set response timeout
    res.setTimeout(timeoutMs, () => {
      logger.warn('Response timeout:', {
        requestId: req.requestId,
        method: req.method,
        url: req.url,
        timeout: timeoutMs,
      });
    });

    next();
  };
};

module.exports = {
  requestLogger,
  metricsCollector,
  sanitizeRequest,
  rateLimitInfo,
  securityHeaders,
  requestTimeout,
};