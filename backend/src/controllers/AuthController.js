const User = require('../models/User');
const Pair = require('../models/Pair');
const jwtService = require('../utils/jwt');
const ApiResponse = require('../utils/response');
const logger = require('../utils/logger');
const {
  NotFoundError,
  ConflictError,
  UnauthorizedError,
} = require('../middleware/errorHandler');

class AuthController {
  /**
   * Register new user
   * POST /api/auth/register
   */
  static async register(req, res) {
    const { phone, name, role, inviteCode } = req.body;

    try {
      // Check if user already exists
      const existingUser = await User.findByPhone(phone);
      if (existingUser) {
        throw new ConflictError('User with this phone number already exists');
      }

      // Create new user
      const user = await User.create({ phone, name, role });

      if (!user) {
        throw new Error('Failed to create user - returned null');
      }

      logger.info('User created successfully', {
        userId: user.id,
        name: user.name,
        role: user.role,
      });

      // If invite code is provided, try to pair users
      if (inviteCode) {
        try {
          // Find the pair with this invitation token
          const pair = await Pair.findByInvitationToken(inviteCode);

          if (pair && pair.status === 'pending') {
            // Check if the roles are compatible
            const canPair =
              (pair.parent_id && role === 'child') ||
              (pair.child_id && role === 'parent');

            if (canPair) {
              // Accept the invitation
              await Pair.acceptInvitation(inviteCode, user.id);
              logger.info('User registered and paired successfully', {
                userId: user.id,
                pairId: pair.id,
                role: user.role,
              });
            }
          }
        } catch (pairError) {
          // Log the error but don't fail registration
          logger.warn('Failed to pair user with invite code', {
            userId: user.id,
            inviteCode,
            error: pairError.message,
          });
        }
      }

      // Generate JWT tokens
      const tokens = jwtService.generateTokenPair(user);

      logger.info('User registered successfully', {
        userId: user.id,
        role: user.role,
        phone: user.phone_masked,
      });

      return ApiResponse.created(
        res,
        {
          user: User.getSafeUserData(user),
          token: tokens.accessToken,
          tokens,
        },
        'User registered successfully'
      );
    } catch (error) {
      logger.error('User registration failed:', error);
      throw error;
    }
  }

  /**
   * Login user
   * POST /api/auth/login
   */
  static async login(req, res) {
    const { phone, inviteCode } = req.body;

    try {
      // Find user by phone
      const user = await User.findByPhone(phone);

      if (!user) {
        throw new UnauthorizedError('Invalid phone number');
      }

      // If invite code is provided, verify user has access to that pair
      if (inviteCode) {
        const pairs = await Pair.findActivePairsForUser(user.id);
        // You can add additional verification here if needed
      }

      // Generate JWT tokens
      const tokens = jwtService.generateTokenPair(user);

      logger.info('User logged in successfully', {
        userId: user.id,
        role: user.role,
      });

      return ApiResponse.success(
        res,
        {
          user: User.getSafeUserData(user),
          token: tokens.accessToken,
          tokens,
        },
        'Login successful'
      );
    } catch (error) {
      logger.error('User login failed:', error);
      throw error;
    }
  }

  /**
   * Create invitation link
   * POST /api/auth/invite
   */
  static async createInvitation(req, res) {
    const { inviter_phone, inviter_name, inviter_role } = req.body;

    try {
      // Check if inviter already exists
      let inviter = await User.findByPhone(inviter_phone);

      if (!inviter) {
        // Create inviter user
        inviter = await User.create({
          phone: inviter_phone,
          name: inviter_name,
          role: inviter_role,
        });
      }

      // Check if inviter already has an active pair
      const existingPairs = await Pair.findActivePairsForUser(inviter.id);
      if (existingPairs.length > 0) {
        throw new ConflictError('User already has an active pair');
      }

      // Check for pending invitations
      const pendingPairs = await Pair.find({
        parent_id: inviter.id,
        status: 'pending',
      });
      if (pendingPairs.length > 0) {
        throw new ConflictError('User already has a pending invitation');
      }

      // Create pair with invitation token
      const pairData =
        inviter_role === 'parent'
          ? { parent_id: inviter.id, child_id: null }
          : { parent_id: null, child_id: inviter.id };

      const pair = await Pair.create(pairData);

      // Generate invitation URL
      const baseUrl = process.env.FRONTEND_URL || 'https://mundapdari.com';
      const invitationUrl = `${baseUrl}/invite/${pair.invitation_token}`;

      logger.info('Invitation created', {
        pairId: pair.id,
        inviterId: inviter.id,
        inviterRole: inviter_role,
      });

      return ApiResponse.created(
        res,
        {
          invitation_url: invitationUrl,
          invitation_token: pair.invitation_token,
          expires_at: pair.invitation_expires_at,
          inviter: User.getSafeUserData(inviter),
        },
        'Invitation created successfully'
      );
    } catch (error) {
      logger.error('Invitation creation failed:', error);
      throw error;
    }
  }

  /**
   * Accept invitation and pair users
   * POST /api/auth/accept
   */
  static async acceptInvitation(req, res) {
    const { invitee_phone, invitee_name, invitee_role } = req.body;
    const { pair, token } = req.invitation; // From validateInvitationToken middleware

    try {
      // Check if invitee already exists
      let invitee = await User.findByPhone(invitee_phone);

      if (!invitee) {
        // Create invitee user
        invitee = await User.create({
          phone: invitee_phone,
          name: invitee_name,
          role: invitee_role,
        });
      }

      // Verify role compatibility
      const parentId = pair.parent_id;
      const childId = pair.child_id;

      if (parentId && invitee_role !== 'child') {
        throw new ConflictError('This invitation requires a child role');
      }
      if (childId && invitee_role !== 'parent') {
        throw new ConflictError('This invitation requires a parent role');
      }

      // Accept invitation
      const updatedPair = await Pair.acceptInvitation(token, invitee.id);

      if (!updatedPair) {
        throw new NotFoundError('Failed to accept invitation');
      }

      // Get complete pair information
      const completePair = await Pair.findById(updatedPair.id);
      const partnerInfo = await Pair.getPairPartner(
        invitee.id,
        completePair.id
      );

      // Generate JWT tokens for invitee
      const tokens = jwtService.generateTokenPair(invitee);

      logger.info('Invitation accepted successfully', {
        pairId: completePair.id,
        inviteeId: invitee.id,
        inviteeRole: invitee_role,
      });

      return ApiResponse.created(
        res,
        {
          user: User.getSafeUserData(invitee),
          pair: {
            id: completePair.id,
            status: completePair.status,
            partner: partnerInfo,
            created_at: completePair.created_at,
          },
          tokens,
        },
        'Invitation accepted successfully'
      );
    } catch (error) {
      logger.error('Invitation acceptance failed:', error);
      throw error;
    }
  }

  /**
   * Verify JWT token
   * GET /api/auth/verify
   */
  static async verifyToken(req, res) {
    // User info is already added by validateJWT middleware
    const user = await User.findById(req.user.id);

    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    return ApiResponse.success(
      res,
      {
        user: User.getSafeUserData(user),
        token_valid: true,
        expires_at: new Date(req.user.tokenPayload.exp * 1000),
      },
      'Token is valid'
    );
  }

  /**
   * Refresh JWT token
   * POST /api/auth/refresh
   */
  static async refreshToken(req, res) {
    const { refresh_token } = req.body;

    try {
      // Verify refresh token
      const decoded = jwtService.verifyRefreshToken(refresh_token);

      // Get user
      const user = await User.findById(decoded.userId);
      if (!user || !user.is_active) {
        throw new UnauthorizedError('Invalid refresh token');
      }

      // Generate new tokens
      const tokens = jwtService.generateTokenPair(user);

      logger.info('Token refreshed', { userId: user.id });

      return ApiResponse.success(
        res,
        {
          user: User.getSafeUserData(user),
          tokens,
        },
        'Token refreshed successfully'
      );
    } catch (error) {
      logger.error('Token refresh failed:', error);
      throw new UnauthorizedError('Token refresh failed');
    }
  }

  /**
   * Get user profile
   * GET /api/auth/profile
   */
  static async getProfile(req, res) {
    try {
      const user = await User.findById(req.user.id);
      if (!user) {
        throw new NotFoundError('User not found');
      }

      // Get user's pairs
      const pairs = await Pair.findActivePairsForUser(user.id);

      // Get user statistics
      const stats = await User.getUserStats(user.id);

      return ApiResponse.success(
        res,
        {
          user: User.getSafeUserData(user),
          pairs: pairs.map((pair) => ({
            id: pair.id,
            partner_name:
              pair.parent_id === user.id ? pair.child_name : pair.parent_name,
            partner_role: pair.parent_id === user.id ? 'child' : 'parent',
            created_at: pair.created_at,
          })),
          stats,
        },
        'Profile retrieved successfully'
      );
    } catch (error) {
      logger.error('Profile retrieval failed:', error);
      throw error;
    }
  }

  /**
   * Update user profile
   * PUT /api/auth/profile
   */
  static async updateProfile(req, res) {
    const { name } = req.body;
    const userId = req.user.id;

    try {
      const updatedUser = await User.update(userId, { name });

      if (!updatedUser) {
        throw new NotFoundError('User not found');
      }

      logger.info('Profile updated', { userId });

      return ApiResponse.success(
        res,
        {
          user: User.getSafeUserData(updatedUser),
        },
        'Profile updated successfully'
      );
    } catch (error) {
      logger.error('Profile update failed:', error);
      throw error;
    }
  }

  /**
   * Logout user (token invalidation would be handled by Redis blacklist in production)
   * POST /api/auth/logout
   */
  static async logout(req, res) {
    const userId = req.user.id;

    try {
      // In production, add token to Redis blacklist
      // For now, just log the logout
      logger.info('User logged out', { userId });

      return ApiResponse.success(res, null, 'Logged out successfully');
    } catch (error) {
      logger.error('Logout failed:', error);
      throw error;
    }
  }

  /**
   * Get user's pairs
   * GET /api/auth/pairs
   */
  static async getUserPairs(req, res) {
    try {
      const pairs = await Pair.findActivePairsForUser(req.user.id);

      const pairsWithStats = await Promise.all(
        pairs.map(async (pair) => {
          const stats = await Pair.getPairStats(pair.id);
          return {
            id: pair.id,
            partner_name:
              pair.parent_id === req.user.id
                ? pair.child_name
                : pair.parent_name,
            partner_role: pair.parent_id === req.user.id ? 'child' : 'parent',
            created_at: pair.created_at,
            status: pair.status,
            stats,
          };
        })
      );

      return ApiResponse.success(
        res,
        {
          pairs: pairsWithStats,
        },
        'Pairs retrieved successfully'
      );
    } catch (error) {
      logger.error('Failed to get user pairs:', error);
      throw error;
    }
  }

  /**
   * Deactivate user account
   * DELETE /api/auth/account
   */
  static async deactivateAccount(req, res) {
    const userId = req.user.id;

    try {
      // Deactivate user
      const deactivated = await User.deactivate(userId);

      if (!deactivated) {
        throw new NotFoundError('User not found');
      }

      // Deactivate all user's pairs
      const pairs = await Pair.findActivePairsForUser(userId);
      await Promise.all(
        pairs.map((pair) => Pair.deactivate(pair.id, 'account_deactivated'))
      );

      logger.info('User account deactivated', { userId });

      return ApiResponse.success(res, null, 'Account deactivated successfully');
    } catch (error) {
      logger.error('Account deactivation failed:', error);
      throw error;
    }
  }
}

module.exports = AuthController;
