const jwt = require('jsonwebtoken');
const config = require('../config');
const logger = require('./logger');

class JWTService {
  /**
   * Generate access token
   * @param {object} payload - Token payload
   * @returns {string} - JWT token
   */
  generateAccessToken(payload) {
    try {
      return jwt.sign(payload, config.jwt.secret, {
        expiresIn: config.jwt.expiresIn,
        issuer: 'mundapdari',
        audience: 'mundapdari-users',
      });
    } catch (error) {
      logger.error('Failed to generate access token:', error);
      throw new Error('Token generation failed');
    }
  }

  /**
   * Generate refresh token
   * @param {object} payload - Token payload
   * @returns {string} - JWT refresh token
   */
  generateRefreshToken(payload) {
    try {
      return jwt.sign(payload, config.jwt.refreshSecret, {
        expiresIn: config.jwt.refreshExpiresIn,
        issuer: 'mundapdari',
        audience: 'mundapdari-users',
      });
    } catch (error) {
      logger.error('Failed to generate refresh token:', error);
      throw new Error('Refresh token generation failed');
    }
  }

  /**
   * Generate both access and refresh tokens
   * @param {object} user - User object
   * @returns {object} - Object containing both tokens
   */
  generateTokenPair(user) {
    const payload = {
      userId: user.id,
      phone: user.phone,
      role: user.role,
      iat: Math.floor(Date.now() / 1000),
    };

    return {
      accessToken: this.generateAccessToken(payload),
      refreshToken: this.generateRefreshToken({ userId: user.id }),
    };
  }

  /**
   * Verify access token
   * @param {string} token - JWT token to verify
   * @returns {object} - Decoded token payload
   */
  verifyAccessToken(token) {
    try {
      return jwt.verify(token, config.jwt.secret, {
        issuer: 'mundapdari',
        audience: 'mundapdari-users',
      });
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new Error('Access token expired');
      } else if (error.name === 'JsonWebTokenError') {
        throw new Error('Invalid access token');
      } else {
        logger.error('Access token verification failed:', error);
        throw new Error('Token verification failed');
      }
    }
  }

  /**
   * Verify refresh token
   * @param {string} token - JWT refresh token to verify
   * @returns {object} - Decoded token payload
   */
  verifyRefreshToken(token) {
    try {
      return jwt.verify(token, config.jwt.refreshSecret, {
        issuer: 'mundapdari',
        audience: 'mundapdari-users',
      });
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new Error('Refresh token expired');
      } else if (error.name === 'JsonWebTokenError') {
        throw new Error('Invalid refresh token');
      } else {
        logger.error('Refresh token verification failed:', error);
        throw new Error('Refresh token verification failed');
      }
    }
  }

  /**
   * Decode token without verification (for debugging)
   * @param {string} token - JWT token to decode
   * @returns {object} - Decoded token payload
   */
  decodeToken(token) {
    try {
      return jwt.decode(token, { complete: true });
    } catch (error) {
      logger.error('Token decode failed:', error);
      throw new Error('Token decode failed');
    }
  }

  /**
   * Get token expiration time
   * @param {string} token - JWT token
   * @returns {Date} - Expiration date
   */
  getTokenExpiration(token) {
    try {
      const decoded = this.decodeToken(token);
      return new Date(decoded.payload.exp * 1000);
    } catch (error) {
      throw new Error('Cannot get token expiration');
    }
  }

  /**
   * Check if token is expired
   * @param {string} token - JWT token
   * @returns {boolean} - True if expired
   */
  isTokenExpired(token) {
    try {
      const expiration = this.getTokenExpiration(token);
      return expiration < new Date();
    } catch (error) {
      return true; // Consider invalid tokens as expired
    }
  }

  /**
   * Extract token from Authorization header
   * @param {string} authHeader - Authorization header value
   * @returns {string|null} - Extracted token or null
   */
  extractTokenFromHeader(authHeader) {
    if (!authHeader) {
      return null;
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return null;
    }

    return parts[1];
  }

  /**
   * Generate invitation token (short-lived, for invitations)
   * @param {object} payload - Token payload
   * @param {string} expiresIn - Expiration time (default: 24h)
   * @returns {string} - JWT token
   */
  generateInvitationToken(payload, expiresIn = '24h') {
    try {
      return jwt.sign(payload, config.jwt.secret, {
        expiresIn,
        issuer: 'mundapdari',
        audience: 'mundapdari-invitations',
      });
    } catch (error) {
      logger.error('Failed to generate invitation token:', error);
      throw new Error('Invitation token generation failed');
    }
  }

  /**
   * Verify invitation token
   * @param {string} token - JWT invitation token
   * @returns {object} - Decoded token payload
   */
  verifyInvitationToken(token) {
    try {
      return jwt.verify(token, config.jwt.secret, {
        issuer: 'mundapdari',
        audience: 'mundapdari-invitations',
      });
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new Error('Invitation token expired');
      } else if (error.name === 'JsonWebTokenError') {
        throw new Error('Invalid invitation token');
      } else {
        logger.error('Invitation token verification failed:', error);
        throw new Error('Invitation token verification failed');
      }
    }
  }
}

// Singleton instance
const jwtService = new JWTService();

module.exports = jwtService;
