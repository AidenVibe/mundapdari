const { BaseModel } = require('./index');
const encryptionService = require('../utils/encryption');
const logger = require('../utils/logger');
const { v4: uuidv4 } = require('uuid');

class User extends BaseModel {
  constructor() {
    super('users');
  }

  /**
   * Create new user with encrypted phone number
   * @param {object} userData - User data
   * @returns {Promise<object>} - Created user
   */
  async create(userData) {
    try {
      // Normalize and encrypt phone number
      const normalizedPhone = encryptionService.normalizePhoneNumber(
        userData.phone
      );
      const encryptedPhone = encryptionService.encrypt(normalizedPhone);

      const data = {
        id: uuidv4(), // Generate UUID for new user
        ...userData,
        phone_encrypted: JSON.stringify(encryptedPhone), // Store as JSON string in correct column
        created_at: new Date().toISOString(),
        status: 'active', // Use status instead of is_active
      };

      // Remove phone from data since we're using phone_encrypted
      delete data.phone;
      // Remove is_active if it exists, use status instead
      delete data.is_active;

      // Remove any undefined fields
      Object.keys(data).forEach((key) => {
        if (data[key] === undefined) {
          delete data[key];
        }
      });

      const user = await super.create(data);

      // Return user with decrypted phone for API response
      return this.decryptUserPhone(user);
    } catch (error) {
      logger.error('Failed to create user:', error);
      throw error;
    }
  }

  /**
   * Find user by encrypted phone number
   * @param {string} phone - Plain phone number
   * @returns {Promise<object|null>} - Found user or null
   */
  async findByPhone(phone) {
    try {
      const normalizedPhone = encryptionService.normalizePhoneNumber(phone);

      // Get all users and decrypt phones to find match (not ideal for large datasets)
      const users = await super.find();

      for (const user of users) {
        try {
          const decryptedPhone = this.decryptPhone(user.phone_encrypted);
          if (decryptedPhone === normalizedPhone) {
            return this.decryptUserPhone(user);
          }
        } catch (error) {
          // Skip users with invalid encrypted phone data
          continue;
        }
      }

      return null;
    } catch (error) {
      logger.error('Failed to find user by phone:', error);
      throw error;
    }
  }

  /**
   * Find user by ID with decrypted phone
   * @param {string} id - User ID
   * @returns {Promise<object|null>} - Found user or null
   */
  async findById(id) {
    const user = await super.findById(id);
    return user ? this.decryptUserPhone(user) : null;
  }

  /**
   * Find multiple users with decrypted phones
   * @param {object} conditions - WHERE conditions
   * @param {object} options - Query options
   * @returns {Promise<array>} - Found users
   */
  async find(conditions = {}, options = {}) {
    const users = await super.find(conditions, options);
    return users.map((user) => this.decryptUserPhone(user));
  }

  /**
   * Find user pairs (parent-child relationships)
   * @param {string} userId - User ID
   * @returns {Promise<array>} - User's pairs
   */
  async findUserPairs(userId) {
    const sql = `
      SELECT 
        p.*,
        parent_user.name as parent_name,
        child_user.name as child_name
      FROM pairs p
      JOIN users parent_user ON p.parent_id = parent_user.id
      JOIN users child_user ON p.child_id = child_user.id
      WHERE (p.parent_id = ? OR p.child_id = ?)
        AND p.status = 'active'
    `;

    const result = await this.query(sql, [userId, userId]);
    return result.rows || result.rows;
  }

  /**
   * Update user activity timestamp
   * @param {string} userId - User ID
   * @returns {Promise<boolean>} - Success status
   */
  async updateLastActive(userId) {
    try {
      const sql = `
        UPDATE ${this.tableName}
        SET last_active = CURRENT_TIMESTAMP
        WHERE id = ?
      `;

      const result = await this.query(sql, [userId]);
      return (result.rowCount || result.changes) > 0;
    } catch (error) {
      logger.error('Failed to update last active:', error);
      return false;
    }
  }

  /**
   * Deactivate user account
   * @param {string} userId - User ID
   * @returns {Promise<boolean>} - Success status
   */
  async deactivate(userId) {
    try {
      const updated = await super.update(userId, { status: 'inactive' });
      return updated !== null;
    } catch (error) {
      logger.error('Failed to deactivate user:', error);
      throw error;
    }
  }

  /**
   * Get user statistics
   * @param {string} userId - User ID
   * @returns {Promise<object>} - User statistics
   */
  async getUserStats(userId) {
    try {
      const sql = `
        SELECT 
          COUNT(DISTINCT a.id) as total_answers,
          COUNT(DISTINCT DATE(a.answered_at)) as active_days,
          COUNT(DISTINCT r.id) as total_reactions_given,
          COUNT(DISTINCT reactions_received.id) as total_reactions_received
        FROM users u
        LEFT JOIN answers a ON u.id = a.user_id
        LEFT JOIN reactions r ON u.id = r.user_id
        LEFT JOIN answers user_answers ON u.id = user_answers.user_id
        LEFT JOIN reactions reactions_received ON user_answers.id = reactions_received.answer_id
        WHERE u.id = ?
        GROUP BY u.id
      `;

      const result = await this.query(sql, [userId]);

      if (result.rows && result.rows.length > 0) {
        const stats = result.rows[0];
        return {
          totalAnswers: parseInt(stats.total_answers) || 0,
          activeDays: parseInt(stats.active_days) || 0,
          totalReactionsGiven: parseInt(stats.total_reactions_given) || 0,
          totalReactionsReceived: parseInt(stats.total_reactions_received) || 0,
        };
      }

      return {
        totalAnswers: 0,
        activeDays: 0,
        totalReactionsGiven: 0,
        totalReactionsReceived: 0,
      };
    } catch (error) {
      logger.error('Failed to get user stats:', error);
      throw error;
    }
  }

  /**
   * Decrypt phone number from stored format
   * @param {string} encryptedPhoneString - Encrypted phone as JSON string
   * @returns {string} - Decrypted phone number
   */
  decryptPhone(encryptedPhoneString) {
    try {
      const encryptedData = JSON.parse(encryptedPhoneString);
      return encryptionService.decrypt(encryptedData);
    } catch (error) {
      throw new Error('Invalid encrypted phone data');
    }
  }

  /**
   * Decrypt user phone and return safe user object
   * @param {object} user - User object with encrypted phone
   * @returns {object} - User object with decrypted phone
   */
  decryptUserPhone(user) {
    if (!user) return null;

    try {
      const decryptedPhone = this.decryptPhone(user.phone_encrypted);

      return {
        ...user,
        phone: decryptedPhone,
        // For API responses, mask the phone number
        phone_masked: encryptionService.maskSensitiveData(decryptedPhone, 3),
        // Map status to is_active for backward compatibility
        is_active: user.status === 'active',
      };
    } catch (error) {
      logger.error('Failed to decrypt user phone:', error);
      // Return user without phone if decryption fails
      return {
        ...user,
        phone: null,
        phone_masked: '***',
        is_active: user.status === 'active',
      };
    }
  }

  /**
   * Get safe user data for API responses
   * @param {object} user - User object
   * @returns {object} - Safe user data
   */
  static getSafeUserData(user) {
    if (!user) return null;

    return {
      id: user.id,
      name: user.name,
      role: user.role,
      phone_masked: user.phone_masked,
      created_at: user.created_at,
      last_active: user.last_active,
      is_active: user.is_active,
    };
  }

  /**
   * Instance method for backward compatibility
   * @param {object} user - User object
   * @returns {object} - Safe user data
   */
  getSafeUserData(user) {
    return User.getSafeUserData(user);
  }
}

module.exports = new User();