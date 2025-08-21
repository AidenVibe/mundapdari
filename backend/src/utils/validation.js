const Joi = require('joi');

/**
 * Common validation schemas and utilities
 */

// Base schemas
const phoneSchema = Joi.string()
  .pattern(/^(\+82|0)(10|11|16|17|18|19)\d{7,8}$/)
  .required()
  .messages({
    'string.pattern.base': 'Invalid Korean phone number format',
    'any.required': 'Phone number is required',
  });

const nameSchema = Joi.string()
  .min(2)
  .max(50)
  .pattern(/^[가-힣a-zA-Z\s]+$/)
  .required()
  .messages({
    'string.min': 'Name must be at least 2 characters long',
    'string.max': 'Name must not exceed 50 characters',
    'string.pattern.base': 'Name can only contain Korean characters, English letters, and spaces',
    'any.required': 'Name is required',
  });

const roleSchema = Joi.string()
  .valid('parent', 'child')
  .required()
  .messages({
    'any.only': 'Role must be either "parent" or "child"',
    'any.required': 'Role is required',
  });

const uuidSchema = Joi.string()
  .uuid()
  .required()
  .messages({
    'string.uuid': 'Must be a valid UUID',
    'any.required': 'ID is required',
  });

const answerContentSchema = Joi.string()
  .min(1)
  .max(500)
  .required()
  .messages({
    'string.min': 'Answer cannot be empty',
    'string.max': 'Answer must not exceed 500 characters',
    'any.required': 'Answer content is required',
  });

const emojiSchema = Joi.string()
  .pattern(/^[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]$/u)
  .required()
  .messages({
    'string.pattern.base': 'Must be a valid emoji',
    'any.required': 'Emoji is required',
  });

// Validation schemas for different endpoints
const validationSchemas = {
  // Auth validations
  register: Joi.object({
    phone: phoneSchema,
    name: nameSchema,
    role: roleSchema,
    inviteCode: Joi.string().optional().allow(''),
  }),

  login: Joi.object({
    phone: phoneSchema,
    inviteCode: Joi.string().optional().allow(''),
  }),

  invite: Joi.object({
    inviter_phone: phoneSchema,
    inviter_name: nameSchema,
    inviter_role: roleSchema,
  }),

  acceptInvitation: Joi.object({
    invitation_token: Joi.string().required(),
    invitee_phone: phoneSchema,
    invitee_name: nameSchema,
    invitee_role: roleSchema,
  }),

  refreshToken: Joi.object({
    refresh_token: Joi.string().required(),
  }),

  // Answer validations
  submitAnswer: Joi.object({
    question_id: uuidSchema,
    content: answerContentSchema,
  }),

  updateAnswer: Joi.object({
    content: answerContentSchema,
  }),

  addReaction: Joi.object({
    emoji: emojiSchema,
  }),

  // Query parameter validations
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
  }),

  dateRange: Joi.object({
    start_date: Joi.date().iso(),
    end_date: Joi.date().iso().min(Joi.ref('start_date')),
  }),
};

/**
 * Validation middleware factory
 * @param {object} schema - Joi validation schema
 * @param {string} source - Where to validate ('body', 'query', 'params')
 * @returns {function} - Express middleware function
 */
const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[source], {
      abortEarly: false,
      stripUnknown: true,
      convert: true,
    });

    if (error) {
      const validationErrors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value,
      }));

      return res.status(422).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors,
        timestamp: new Date().toISOString(),
      });
    }

    // Replace the request data with validated and sanitized data
    req[source] = value;
    next();
  };
};

/**
 * Custom validation utilities
 */
const validationUtils = {
  /**
   * Validate Korean phone number format
   * @param {string} phone - Phone number to validate
   * @returns {boolean} - Validation result
   */
  isValidKoreanPhone(phone) {
    const phoneRegex = /^(\+82|0)(10|11|16|17|18|19)\d{7,8}$/;
    return phoneRegex.test(phone);
  },

  /**
   * Validate Korean name format
   * @param {string} name - Name to validate
   * @returns {boolean} - Validation result
   */
  isValidKoreanName(name) {
    const nameRegex = /^[가-힣a-zA-Z\s]{2,50}$/;
    return nameRegex.test(name);
  },

  /**
   * Validate UUID format
   * @param {string} id - UUID to validate
   * @returns {boolean} - Validation result
   */
  isValidUUID(id) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
  },

  /**
   * Validate emoji
   * @param {string} emoji - Emoji to validate
   * @returns {boolean} - Validation result
   */
  isValidEmoji(emoji) {
    const emojiRegex = /^[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]$/u;
    return emojiRegex.test(emoji);
  },

  /**
   * Sanitize string input
   * @param {string} input - String to sanitize
   * @returns {string} - Sanitized string
   */
  sanitizeString(input) {
    if (typeof input !== 'string') return input;
    
    return input
      .trim()
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .substring(0, 1000); // Limit length
  },

  /**
   * Validate date range
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {boolean} - Validation result
   */
  isValidDateRange(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    return start instanceof Date && 
           end instanceof Date && 
           !isNaN(start) && 
           !isNaN(end) && 
           start <= end;
  },
};

module.exports = {
  validationSchemas,
  validate,
  validationUtils,
  // Export individual schemas for reuse
  phoneSchema,
  nameSchema,
  roleSchema,
  uuidSchema,
  answerContentSchema,
  emojiSchema,
};