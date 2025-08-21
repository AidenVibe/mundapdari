/**
 * Standardized API Response Utility
 * Provides consistent response format across all endpoints
 */

class ApiResponse {
  /**
   * Send success response
   * @param {object} res - Express response object
   * @param {any} data - Response data
   * @param {string} message - Success message
   * @param {number} statusCode - HTTP status code (default: 200)
   */
  static success(res, data = null, message = 'Success', statusCode = 200) {
    const response = {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    };

    // Don't include data property if it's null
    if (data === null) {
      delete response.data;
    }

    return res.status(statusCode).json(response);
  }

  /**
   * Send error response
   * @param {object} res - Express response object
   * @param {string} message - Error message
   * @param {number} statusCode - HTTP status code (default: 400)
   * @param {any} errors - Detailed error information
   */
  static error(res, message = 'An error occurred', statusCode = 400, errors = null) {
    const response = {
      success: false,
      message,
      timestamp: new Date().toISOString(),
    };

    // Include errors if provided
    if (errors) {
      response.errors = errors;
    }

    return res.status(statusCode).json(response);
  }

  /**
   * Send validation error response
   * @param {object} res - Express response object
   * @param {array} validationErrors - Array of validation errors
   * @param {string} message - Error message
   */
  static validationError(res, validationErrors, message = 'Validation failed') {
    return this.error(res, message, 422, validationErrors);
  }

  /**
   * Send unauthorized response
   * @param {object} res - Express response object
   * @param {string} message - Error message
   */
  static unauthorized(res, message = 'Unauthorized access') {
    return this.error(res, message, 401);
  }

  /**
   * Send forbidden response
   * @param {object} res - Express response object
   * @param {string} message - Error message
   */
  static forbidden(res, message = 'Access forbidden') {
    return this.error(res, message, 403);
  }

  /**
   * Send not found response
   * @param {object} res - Express response object
   * @param {string} message - Error message
   */
  static notFound(res, message = 'Resource not found') {
    return this.error(res, message, 404);
  }

  /**
   * Send internal server error response
   * @param {object} res - Express response object
   * @param {string} message - Error message
   */
  static serverError(res, message = 'Internal server error') {
    return this.error(res, message, 500);
  }

  /**
   * Send paginated response
   * @param {object} res - Express response object
   * @param {array} data - Response data
   * @param {object} pagination - Pagination metadata
   * @param {string} message - Success message
   */
  static paginated(res, data, pagination, message = 'Success') {
    const response = {
      success: true,
      message,
      data,
      pagination: {
        page: pagination.page || 1,
        limit: pagination.limit || 10,
        total: pagination.total || 0,
        totalPages: Math.ceil((pagination.total || 0) / (pagination.limit || 10)),
        hasNext: pagination.hasNext || false,
        hasPrev: pagination.hasPrev || false,
      },
      timestamp: new Date().toISOString(),
    };

    return res.status(200).json(response);
  }

  /**
   * Send created response
   * @param {object} res - Express response object
   * @param {any} data - Created resource data
   * @param {string} message - Success message
   */
  static created(res, data, message = 'Resource created successfully') {
    return this.success(res, data, message, 201);
  }

  /**
   * Send no content response
   * @param {object} res - Express response object
   */
  static noContent(res) {
    return res.status(204).send();
  }

  /**
   * Send accepted response (for async operations)
   * @param {object} res - Express response object
   * @param {any} data - Response data
   * @param {string} message - Success message
   */
  static accepted(res, data = null, message = 'Request accepted for processing') {
    return this.success(res, data, message, 202);
  }
}

module.exports = ApiResponse;