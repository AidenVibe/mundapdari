const crypto = require('crypto');
const config = require('../config');

class EncryptionService {
  constructor() {
    this.algorithm = 'aes-256-cbc';
    this.key = Buffer.from(config.encryption.key, 'hex');

    if (this.key.length !== 32) {
      throw new Error(
        `Encryption key must be 32 bytes (64 hex characters). Got ${this.key.length} bytes from key of length ${config.encryption.key?.length}`
      );
    }
  }

  /**
   * Encrypt sensitive data (like phone numbers)
   * @param {string} text - Plain text to encrypt
   * @returns {object} - Encrypted data with IV
   */
  encrypt(text) {
    if (!text) {
      throw new Error('Text to encrypt cannot be empty');
    }

    try {
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);

      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');

      return {
        encrypted,
        iv: iv.toString('hex'),
      };
    } catch (error) {
      throw new Error(`Encryption failed: ${error.message}`);
    }
  }

  /**
   * Decrypt encrypted data
   * @param {object} encryptedData - Object containing encrypted and iv
   * @returns {string} - Decrypted plain text
   */
  decrypt(encryptedData) {
    if (!encryptedData || !encryptedData.encrypted || !encryptedData.iv) {
      throw new Error('Invalid encrypted data format');
    }

    try {
      const iv = Buffer.from(encryptedData.iv, 'hex');
      const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);

      let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      throw new Error(`Decryption failed: ${error.message}`);
    }
  }

  /**
   * Create a hash for data comparison (one-way)
   * @param {string} text - Text to hash
   * @returns {string} - SHA-256 hash
   */
  hash(text) {
    if (!text) {
      throw new Error('Text to hash cannot be empty');
    }

    return crypto.createHash('sha256').update(text).digest('hex');
  }

  /**
   * Generate a secure random token
   * @param {number} length - Token length in bytes (default: 32)
   * @returns {string} - Random token in hex format
   */
  generateToken(length = 32) {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Generate a secure random invitation code
   * @param {number} length - Code length (default: 8)
   * @returns {string} - Random alphanumeric code
   */
  generateInvitationCode(length = 8) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';

    for (let i = 0; i < length; i++) {
      const randomIndex = crypto.randomInt(0, chars.length);
      result += chars[randomIndex];
    }

    return result;
  }

  /**
   * Validate phone number format and normalize
   * @param {string} phone - Phone number to validate
   * @returns {string} - Normalized phone number
   */
  normalizePhoneNumber(phone) {
    if (!phone) {
      throw new Error('Phone number cannot be empty');
    }

    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '');

    // Korean phone number validation
    if (cleaned.length === 11 && cleaned.startsWith('010')) {
      return `+82${cleaned.substring(1)}`;
    } else if (cleaned.length === 10 && cleaned.startsWith('10')) {
      return `+82${cleaned}`;
    }

    throw new Error('Invalid Korean phone number format');
  }

  /**
   * Mask sensitive data for logging
   * @param {string} data - Data to mask
   * @param {number} visibleChars - Number of characters to show (default: 3)
   * @returns {string} - Masked data
   */
  maskSensitiveData(data, visibleChars = 3) {
    if (!data || data.length <= visibleChars) {
      return '*'.repeat(data ? data.length : 0);
    }

    const visible = data.substring(0, visibleChars);
    const masked = '*'.repeat(data.length - visibleChars);

    return visible + masked;
  }
}

// Singleton instance
const encryptionService = new EncryptionService();

module.exports = encryptionService;
