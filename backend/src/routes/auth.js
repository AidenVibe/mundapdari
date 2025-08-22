const express = require('express');
const router = express.Router();
const { validate, validationSchemas } = require('../utils/validation');
const { validateInvitationToken, validateJWT } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const AuthController = require('../controllers/AuthController');

/**
 * User registration
 * POST /api/auth/register
 */
router.post(
  '/register',
  validate(validationSchemas.register, 'body'),
  asyncHandler(AuthController.register)
);

/**
 * User login
 * POST /api/auth/login
 */
router.post(
  '/login',
  validate(validationSchemas.login, 'body'),
  asyncHandler(AuthController.login)
);

/**
 * Create invitation link
 * POST /api/auth/invite
 */
router.post(
  '/invite',
  validate(validationSchemas.invite, 'body'),
  asyncHandler(AuthController.createInvitation)
);

/**
 * Accept invitation and pair users
 * POST /api/auth/accept
 */
router.post(
  '/accept',
  validate(validationSchemas.acceptInvitation, 'body'),
  validateInvitationToken,
  asyncHandler(AuthController.acceptInvitation)
);

/**
 * Verify JWT token
 * GET /api/auth/verify
 */
router.get('/verify', validateJWT, asyncHandler(AuthController.verifyToken));

/**
 * Refresh JWT token
 * POST /api/auth/refresh
 */
router.post(
  '/refresh',
  validate(validationSchemas.refreshToken, 'body'),
  asyncHandler(AuthController.refreshToken)
);

/**
 * Get user profile
 * GET /api/auth/profile
 */
router.get('/profile', validateJWT, asyncHandler(AuthController.getProfile));

/**
 * Update user profile
 * PUT /api/auth/profile
 */
router.put(
  '/profile',
  validateJWT,
  validate(
    validationSchemas.register.fork(['phone'], (schema) => schema.optional()),
    'body'
  ),
  asyncHandler(AuthController.updateProfile)
);

/**
 * Logout user (invalidate tokens)
 * POST /api/auth/logout
 */
router.post('/logout', validateJWT, asyncHandler(AuthController.logout));

/**
 * Get user's pairs
 * GET /api/auth/pairs
 */
router.get('/pairs', validateJWT, asyncHandler(AuthController.getUserPairs));

/**
 * Deactivate user account
 * DELETE /api/auth/account
 */
router.delete(
  '/account',
  validateJWT,
  asyncHandler(AuthController.deactivateAccount)
);

module.exports = router;
