const logger = require('../utils/logger');
const ApiResponse = require('../utils/response');
const config = require('../config');

/**
 * Global error handling middleware
 * Must be the last middleware in the stack
 */
const errorHandler = (err, req, res, next) => {
  // Log the error
  logger.error('Unhandled error:', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user?.id,
  });

  // Default error response
  let statusCode = 500;
  let message = 'Internal server error';
  let errors = null;

  // Handle specific error types
  if (err.name === 'ValidationError') {
    statusCode = 422;
    message = 'Validation failed';
    errors = err.details || err.errors;
  } else if (err.name === 'UnauthorizedError' || err.message.includes('unauthorized')) {
    statusCode = 401;
    message = 'Unauthorized access';
  } else if (err.name === 'ForbiddenError' || err.message.includes('forbidden')) {
    statusCode = 403;
    message = 'Access forbidden';
  } else if (err.name === 'NotFoundError' || err.message.includes('not found')) {
    statusCode = 404;
    message = 'Resource not found';
  } else if (err.name === 'ConflictError' || err.message.includes('conflict')) {
    statusCode = 409;
    message = 'Resource conflict';
  } else if (err.name === 'TooManyRequestsError' || err.message.includes('rate limit')) {
    statusCode = 429;
    message = 'Too many requests';
  } else if (err.code === 'LIMIT_FILE_SIZE') {
    statusCode = 413;
    message = 'File too large';
  } else if (err.code === 'EBADCSRFTOKEN') {
    statusCode = 403;
    message = 'Invalid CSRF token';
  } else if (err.type === 'entity.parse.failed') {
    statusCode = 400;
    message = 'Invalid JSON format';
  } else if (err.type === 'entity.too.large') {
    statusCode = 413;
    message = 'Request payload too large';
  }

  // Database specific errors
  if (err.code) {
    switch (err.code) {
      case '23505': // PostgreSQL unique violation
        statusCode = 409;
        message = 'Resource already exists';
        break;
      case '23503': // PostgreSQL foreign key violation
        statusCode = 400;
        message = 'Invalid reference to related resource';
        break;
      case '23502': // PostgreSQL not null violation
        statusCode = 400;
        message = 'Required field missing';
        break;
      case 'SQLITE_CONSTRAINT':
        statusCode = 400;
        message = 'Database constraint violation';
        break;
    }
  }

  // JWT specific errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid authentication token';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Authentication token expired';
  }

  // Rate limiting errors
  if (err.status === 429) {
    statusCode = 429;
    message = 'Too many requests, please try again later';
  }

  // In development, include stack trace
  const response = {
    success: false,
    message,
    timestamp: new Date().toISOString(),
  };

  if (errors) {
    response.errors = errors;
  }

  if (config.app.env === 'development') {
    response.stack = err.stack;
    response.details = {
      name: err.name,
      code: err.code,
      type: err.type,
    };
  }

  return res.status(statusCode).json(response);
};

/**
 * 404 Not Found handler
 * Must be placed after all routes but before error handler
 */
const notFoundHandler = (req, res, next) => {
  logger.warn('Route not found:', {
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });

  return ApiResponse.notFound(res, `Route ${req.method} ${req.url} not found`);
};

/**
 * Async error wrapper
 * Wraps async route handlers to catch errors
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Custom error classes
 */
class AppError extends Error {
  constructor(message, statusCode = 500, isOperational = true) {
    super(message);
    
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.timestamp = new Date().toISOString();
    
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message, errors = null) {
    super(message, 422);
    this.name = 'ValidationError';
    this.errors = errors;
  }
}

class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized access') {
    super(message, 401);
    this.name = 'UnauthorizedError';
  }
}

class ForbiddenError extends AppError {
  constructor(message = 'Access forbidden') {
    super(message, 403);
    this.name = 'ForbiddenError';
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404);
    this.name = 'NotFoundError';
  }
}

class ConflictError extends AppError {
  constructor(message = 'Resource conflict') {
    super(message, 409);
    this.name = 'ConflictError';
  }
}

class TooManyRequestsError extends AppError {
  constructor(message = 'Too many requests') {
    super(message, 429);
    this.name = 'TooManyRequestsError';
  }
}

/**
 * Error handling utilities
 */
const errorUtils = {
  /**
   * Create and throw validation error
   * @param {string} message - Error message
   * @param {array} errors - Validation errors
   */
  throwValidationError(message, errors = null) {
    throw new ValidationError(message, errors);
  },

  /**
   * Create and throw unauthorized error
   * @param {string} message - Error message
   */
  throwUnauthorizedError(message) {
    throw new UnauthorizedError(message);
  },

  /**
   * Create and throw forbidden error
   * @param {string} message - Error message
   */
  throwForbiddenError(message) {
    throw new ForbiddenError(message);
  },

  /**
   * Create and throw not found error
   * @param {string} message - Error message
   */
  throwNotFoundError(message) {
    throw new NotFoundError(message);
  },

  /**
   * Create and throw conflict error
   * @param {string} message - Error message
   */
  throwConflictError(message) {
    throw new ConflictError(message);
  },

  /**
   * Check if error is operational (expected) or programming error
   * @param {Error} error - Error object
   * @returns {boolean} - True if operational error
   */
  isOperationalError(error) {
    if (error instanceof AppError) {
      return error.isOperational;
    }
    return false;
  },

  /**
   * Log error with appropriate level
   * @param {Error} error - Error object
   * @param {object} context - Additional context
   */
  logError(error, context = {}) {
    const logLevel = this.isOperationalError(error) ? 'warn' : 'error';
    
    logger[logLevel]('Error occurred:', {
      message: error.message,
      name: error.name,
      statusCode: error.statusCode,
      stack: error.stack,
      timestamp: error.timestamp,
      ...context,
    });
  },
};

/**
 * Process shutdown handler
 * Gracefully handle uncaught exceptions and unhandled rejections
 */
const setupErrorHandlers = () => {
  process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception - shutting down...', {
      error: error.message,
      stack: error.stack,
    });
    
    process.exit(1);
  });

  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection - shutting down...', {
      reason: reason.message || reason,
      promise: promise.toString(),
    });
    
    process.exit(1);
  });

  process.on('SIGTERM', () => {
    logger.info('SIGTERM received, shutting down gracefully');
    process.exit(0);
  });

  process.on('SIGINT', () => {
    logger.info('SIGINT received, shutting down gracefully');
    process.exit(0);
  });
};

module.exports = {
  errorHandler,
  notFoundHandler,
  asyncHandler,
  
  // Error classes
  AppError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  TooManyRequestsError,
  
  // Utilities
  errorUtils,
  setupErrorHandlers,
};