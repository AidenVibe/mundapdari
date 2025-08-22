const { BaseModel } = require('./index');
const encryptionService = require('../utils/encryption');
const logger = require('../utils/logger');

class Pair extends BaseModel {
  constructor() {
    super('pairs');
  }

  /**
   * Create new pair with invitation token
   * @param {object} pairData - Pair data
   * @returns {Promise<object>} - Created pair
   */
  async create(pairData) {
    try {
      // Generate invitation token and expiration
      const invitationToken = encryptionService.generateToken(32);
      const invitationExpiresAt = new Date();
      invitationExpiresAt.setHours(invitationExpiresAt.getHours() + 24); // 24 hours

      const data = {
        ...pairData,
        invitation_token: invitationToken,
        invitation_expires_at: invitationExpiresAt.toISOString(),
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const pair = await super.create(data);
      logger.info('Pair created with invitation token', {
        pairId: pair.id,
        status: pair.status,
      });

      return pair;
    } catch (error) {
      logger.error('Failed to create pair:', error);
      throw error;
    }
  }

  /**
   * Find pair by invitation token
   * @param {string} token - Invitation token
   * @returns {Promise<object|null>} - Found pair or null
   */
  async findByInvitationToken(token) {
    try {
      const pair = await this.findOne({ invitation_token: token });

      if (!pair) {
        return null;
      }

      // Check if invitation is expired
      const now = new Date();
      const expiresAt = new Date(pair.invitation_expires_at);

      if (now > expiresAt) {
        logger.warn('Attempted to use expired invitation token', {
          token: token.substring(0, 8) + '...',
          expiresAt: pair.invitation_expires_at,
        });
        return null;
      }

      return pair;
    } catch (error) {
      logger.error('Failed to find pair by invitation token:', error);
      throw error;
    }
  }

  /**
   * Accept invitation and activate pair
   * @param {string} token - Invitation token
   * @param {string} userId - User ID accepting the invitation
   * @returns {Promise<object|null>} - Updated pair or null
   */
  async acceptInvitation(token, userId) {
    try {
      const pair = await this.findByInvitationToken(token);

      if (!pair) {
        throw new Error('Invalid or expired invitation token');
      }

      // Determine which field to update based on existing data
      const updateData = {
        status: 'active',
        invitation_token: null,
        invitation_expires_at: null,
      };

      if (pair.parent_id && !pair.child_id) {
        // Parent exists, add child
        updateData.child_id = userId;
      } else if (pair.child_id && !pair.parent_id) {
        // Child exists, add parent
        updateData.parent_id = userId;
      } else {
        throw new Error('Invalid pair state for invitation');
      }

      // Update pair and activate
      const updatedPair = await this.update(pair.id, updateData);

      if (updatedPair) {
        logger.info('Invitation accepted and pair activated', {
          pairId: pair.id,
          parentId: updatedPair.parent_id,
          childId: updatedPair.child_id,
        });
      }

      return updatedPair;
    } catch (error) {
      logger.error('Failed to accept invitation:', error);
      throw error;
    }
  }

  /**
   * Find active pairs for a user
   * @param {string} userId - User ID
   * @returns {Promise<array>} - Active pairs
   */
  async findActivePairsForUser(userId) {
    try {
      const sql = `
        SELECT 
          p.*,
          parent_user.name as parent_name,
          child_user.name as child_name
        FROM ${this.tableName} p
        LEFT JOIN users parent_user ON p.parent_id = parent_user.id
        LEFT JOIN users child_user ON p.child_id = child_user.id
        WHERE (p.parent_id = $1 OR p.child_id = $1)
          AND p.status = 'active'
        ORDER BY p.created_at DESC
      `;

      const result = await this.query(sql, [userId]);
      return result.rows || result.rows;
    } catch (error) {
      logger.error('Failed to find active pairs for user:', error);
      throw error;
    }
  }

  /**
   * Find pair by parent and child IDs
   * @param {string} parentId - Parent user ID
   * @param {string} childId - Child user ID
   * @returns {Promise<object|null>} - Found pair or null
   */
  async findByParentAndChild(parentId, childId) {
    try {
      return await this.findOne({
        parent_id: parentId,
        child_id: childId,
      });
    } catch (error) {
      logger.error('Failed to find pair by parent and child:', error);
      throw error;
    }
  }

  /**
   * Check if users are paired
   * @param {string} userId1 - First user ID
   * @param {string} userId2 - Second user ID
   * @returns {Promise<boolean>} - True if paired, false otherwise
   */
  async areUsersPaired(userId1, userId2) {
    try {
      const sql = `
        SELECT COUNT(*) as count
        FROM ${this.tableName}
        WHERE ((parent_id = $1 AND child_id = $2) OR (parent_id = $2 AND child_id = $1))
          AND status = 'active'
      `;

      const result = await this.query(sql, [userId1, userId2]);
      const count = result.rows ? result.rows[0].count : result.rows[0].count;

      return parseInt(count) > 0;
    } catch (error) {
      logger.error('Failed to check if users are paired:', error);
      throw error;
    }
  }

  /**
   * Get pair partner for a user
   * @param {string} userId - User ID
   * @param {string} pairId - Pair ID (optional, if user has multiple pairs)
   * @returns {Promise<object|null>} - Partner user info or null
   */
  async getPairPartner(userId, pairId = null) {
    try {
      let sql = `
        SELECT 
          p.id as pair_id,
          CASE 
            WHEN p.parent_id = $1 THEN p.child_id
            ELSE p.parent_id
          END as partner_id,
          CASE 
            WHEN p.parent_id = $1 THEN child_user.name
            ELSE parent_user.name
          END as partner_name,
          CASE 
            WHEN p.parent_id = $1 THEN child_user.role
            ELSE parent_user.role
          END as partner_role
        FROM ${this.tableName} p
        LEFT JOIN users parent_user ON p.parent_id = parent_user.id
        LEFT JOIN users child_user ON p.child_id = child_user.id
        WHERE (p.parent_id = $1 OR p.child_id = $1)
          AND p.status = 'active'
      `;

      const params = [userId];

      if (pairId) {
        sql += ' AND p.id = $2';
        params.push(pairId);
      }

      sql += ' LIMIT 1';

      const result = await this.query(sql, params);
      return result.rows && result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
      logger.error('Failed to get pair partner:', error);
      throw error;
    }
  }

  /**
   * Deactivate pair
   * @param {string} pairId - Pair ID
   * @param {string} reason - Deactivation reason
   * @returns {Promise<boolean>} - Success status
   */
  async deactivate(pairId, reason = 'user_requested') {
    try {
      const updated = await this.update(pairId, {
        status: 'inactive',
        deactivated_at: new Date().toISOString(),
        deactivation_reason: reason,
      });

      if (updated) {
        logger.info('Pair deactivated', { pairId, reason });
        return true;
      }

      return false;
    } catch (error) {
      logger.error('Failed to deactivate pair:', error);
      throw error;
    }
  }

  /**
   * Clean up expired invitations
   * @returns {Promise<number>} - Number of cleaned up invitations
   */
  async cleanupExpiredInvitations() {
    try {
      const sql = `
        DELETE FROM ${this.tableName}
        WHERE status = 'pending'
          AND invitation_expires_at < CURRENT_TIMESTAMP
      `;

      const result = await this.query(sql);
      const deletedCount = result.rowCount || result.changes || 0;

      if (deletedCount > 0) {
        logger.info(`Cleaned up ${deletedCount} expired invitations`);
      }

      return deletedCount;
    } catch (error) {
      logger.error('Failed to cleanup expired invitations:', error);
      throw error;
    }
  }

  /**
   * Get pair statistics
   * @param {string} pairId - Pair ID
   * @returns {Promise<object>} - Pair statistics
   */
  async getPairStats(pairId) {
    try {
      const sql = `
        SELECT 
          COUNT(DISTINCT a.id) as total_answers,
          COUNT(DISTINCT DATE(a.answered_at)) as active_days,
          COUNT(DISTINCT q.id) as questions_answered,
          COUNT(DISTINCT r.id) as total_reactions
        FROM ${this.tableName} p
        LEFT JOIN answers a ON p.id = a.pair_id
        LEFT JOIN questions q ON a.question_id = q.id
        LEFT JOIN reactions r ON a.id = r.answer_id
        WHERE p.id = $1
        GROUP BY p.id
      `;

      const result = await this.query(sql, [pairId]);

      if (result.rows && result.rows.length > 0) {
        const stats = result.rows[0];
        return {
          totalAnswers: parseInt(stats.total_answers) || 0,
          activeDays: parseInt(stats.active_days) || 0,
          questionsAnswered: parseInt(stats.questions_answered) || 0,
          totalReactions: parseInt(stats.total_reactions) || 0,
        };
      }

      return {
        totalAnswers: 0,
        activeDays: 0,
        questionsAnswered: 0,
        totalReactions: 0,
      };
    } catch (error) {
      logger.error('Failed to get pair stats:', error);
      throw error;
    }
  }
}

module.exports = new Pair();
