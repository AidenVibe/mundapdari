const jwtService = require('../utils/jwt');
const ApiResponse = require('../utils/response');
const User = require('../models/User');
const logger = require('../utils/logger');

/**
 * JWT Authentication Middleware
 * Validates JWT tokens and adds user info to request
 */
const validateJWT = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = jwtService.extractTokenFromHeader(authHeader);

    if (!token) {
      return ApiResponse.unauthorized(res, 'Access token required');
    }

    // Verify token
    const decoded = jwtService.verifyAccessToken(token);

    // Get user from database
    const user = await User.findById(decoded.userId);

    if (!user) {
      return ApiResponse.unauthorized(res, 'User not found');
    }

    if (!user.is_active) {
      return ApiResponse.unauthorized(res, 'User account is deactivated');
    }

    // Add user info to request
    req.user = {
      id: user.id,
      phone: user.phone,
      name: user.name,
      role: user.role,
      tokenPayload: decoded,
    };

    // Update user's last active timestamp (async, don't wait)
    User.updateLastActive(user.id).catch((error) => {
      logger.warn('Failed to update user last active:', error);
    });

    next();
  } catch (error) {
    logger.warn('JWT validation failed:', {
      error: error.message,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
    });

    if (error.message.includes('expired')) {
      return ApiResponse.unauthorized(res, 'Access token expired');
    } else if (error.message.includes('invalid')) {
      return ApiResponse.unauthorized(res, 'Invalid access token');
    } else {
      return ApiResponse.unauthorized(res, 'Authentication failed');
    }
  }
};

/**
 * Optional JWT Authentication Middleware
 * Similar to validateJWT but doesn't require authentication
 */
const optionalJWT = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = jwtService.extractTokenFromHeader(authHeader);

    if (token) {
      const decoded = jwtService.verifyAccessToken(token);
      const user = await User.findById(decoded.userId);

      if (user && user.is_active) {
        req.user = {
          id: user.id,
          phone: user.phone,
          name: user.name,
          role: user.role,
          tokenPayload: decoded,
        };

        // Update last active
        User.updateLastActive(user.id).catch((error) => {
          logger.warn('Failed to update user last active:', error);
        });
      }
    }

    next();
  } catch (error) {
    // For optional auth, continue without user info if token is invalid
    logger.debug('Optional JWT validation failed:', error.message);
    next();
  }
};

/**
 * Role-based authorization middleware
 * @param {string|array} roles - Required role(s)
 */
const requireRole = (roles) => {
  const requiredRoles = Array.isArray(roles) ? roles : [roles];

  return (req, res, next) => {
    if (!req.user) {
      return ApiResponse.unauthorized(res, 'Authentication required');
    }

    if (!requiredRoles.includes(req.user.role)) {
      return ApiResponse.forbidden(res, 'Insufficient permissions');
    }

    next();
  };
};

/**
 * Pair membership authorization middleware
 * Ensures user is part of the specified pair
 */
const requirePairMembership = async (req, res, next) => {
  try {
    if (!req.user) {
      return ApiResponse.unauthorized(res, 'Authentication required');
    }

    const pairId = req.params.pairId || req.body.pair_id || req.query.pair_id;

    if (!pairId) {
      return ApiResponse.error(res, 'Pair ID required', 400);
    }

    // Check if user is member of the pair
    const Pair = require('../models/Pair');
    const pair = await Pair.findById(pairId);

    if (!pair) {
      return ApiResponse.notFound(res, 'Pair not found');
    }

    if (pair.parent_id !== req.user.id && pair.child_id !== req.user.id) {
      return ApiResponse.forbidden(
        res,
        'Access denied: Not a member of this pair'
      );
    }

    if (pair.status !== 'active') {
      return ApiResponse.forbidden(res, 'Access denied: Pair is not active');
    }

    // Add pair info to request
    req.pair = pair;
    next();
  } catch (error) {
    logger.error('Pair membership check failed:', error);
    return ApiResponse.serverError(res, 'Failed to verify pair membership');
  }
};

/**
 * Resource ownership authorization middleware
 * Ensures user owns the specified resource
 */
const requireOwnership = (resourceIdParam = 'id', userIdField = 'user_id') => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res, 'Authentication required');
      }

      const resourceId = req.params[resourceIdParam];

      if (!resourceId) {
        return ApiResponse.error(res, `${resourceIdParam} required`, 400);
      }

      // This is a generic middleware, so we'll check ownership in the route handler
      // We just add the ownership requirements to the request
      req.ownershipCheck = {
        resourceId,
        userIdField,
        userId: req.user.id,
      };

      next();
    } catch (error) {
      logger.error('Ownership check setup failed:', error);
      return ApiResponse.serverError(res, 'Failed to verify ownership');
    }
  };
};

/**
 * Rate limiting bypass for authenticated users
 * Allows higher rate limits for authenticated requests
 */
const authRateLimitBypass = (req, res, next) => {
  if (req.user) {
    // Mark request as authenticated for rate limiter
    req.authenticated = true;
  }
  next();
};

/**
 * Development authentication bypass
 * Allows bypassing authentication in development mode
 */
const devAuthBypass = (req, res, next) => {
  const config = require('../config');

  if (
    config.app.env === 'development' &&
    req.headers['x-dev-bypass'] === 'true'
  ) {
    // Create a mock user for development
    req.user = {
      id: 'dev-user-id',
      phone: '+821012345678',
      name: 'Dev User',
      role: 'parent',
      tokenPayload: { userId: 'dev-user-id' },
    };

    logger.warn('Development authentication bypass used', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
    });
  }

  next();
};

/**
 * Invitation token validation middleware
 * Validates invitation tokens for pair creation
 */
const validateInvitationToken = async (req, res, next) => {
  try {
    const { invitation_token } = req.body;

    if (!invitation_token) {
      return ApiResponse.error(res, 'Invitation token required', 400);
    }

    // Verify invitation token
    const decoded = jwtService.verifyInvitationToken(invitation_token);

    // Check if invitation is still valid in database
    const Pair = require('../models/Pair');
    const pair = await Pair.findByInvitationToken(invitation_token);

    if (!pair) {
      return ApiResponse.error(res, 'Invalid or expired invitation', 400);
    }

    // Add invitation info to request
    req.invitation = {
      token: invitation_token,
      pair,
      decoded,
    };

    next();
  } catch (error) {
    logger.warn('Invitation token validation failed:', {
      error: error.message,
      ip: req.ip,
    });

    if (error.message.includes('expired')) {
      return ApiResponse.error(res, 'Invitation token expired', 400);
    } else if (error.message.includes('invalid')) {
      return ApiResponse.error(res, 'Invalid invitation token', 400);
    } else {
      return ApiResponse.error(res, 'Invitation validation failed', 400);
    }
  }
};

module.exports = {
  validateJWT,
  optionalJWT,
  requireRole,
  requirePairMembership,
  requireOwnership,
  authRateLimitBypass,
  devAuthBypass,
  validateInvitationToken,
};
