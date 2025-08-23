const databaseManager = require("../config/database");
const logger = require("../utils/logger");

/**
 * Base Model class with common database operations
 */
class BaseModel {
  constructor(tableName) {
    this.tableName = tableName;
    this.db = databaseManager;
  }

  /**
   * Execute SQL query with error handling
   * @param {string} sql - SQL query
   * @param {array} params - Query parameters
   * @returns {Promise} - Query result
   */
  async query(sql, params = []) {
    try {
      const result = await this.db.query(sql, params);
      return result;
    } catch (error) {
      logger.error(`Database query error in ${this.tableName}:`, {
        sql: sql.substring(0, 100),
        error: error.message,
        params: params.length > 0 ? "provided" : "none",
      });
      throw error;
    }
  }

  /**
   * Find record by ID
   * @param {string} id - Record ID
   * @returns {Promise<object|null>} - Found record or null
   */
  async findById(id) {
    const sql = databaseManager.usePostgres
      ? `SELECT * FROM ${this.tableName} WHERE id = $1`
      : `SELECT * FROM ${this.tableName} WHERE id = ?`;
    console.log(
      `BaseModel findById - Table: ${this.tableName}, ID: ${id}, SQL: ${sql}`
    );
    const result = await this.query(sql, [id]);
    console.log(`BaseModel findById result:`, {
      rowCount: result.rows ? result.rows.length : "no rows property",
      result: result,
      firstRow: result.rows ? result.rows[0] : "no first row",
    });

    // Debug: Let's check if the record actually exists
    if (!databaseManager.usePostgres && result.rows.length === 0) {
      console.log(
        "🔍 DEBUG: Checking if record exists with raw SQLite query..."
      );
      const debugResult = await this.db.allSQLite(
        `SELECT * FROM ${this.tableName}`,
        []
      );
      console.log(
        `🔍 DEBUG: All records in ${this.tableName}:`,
        debugResult.rows
      );
      const specificCheck = await this.db.allSQLite(
        `SELECT * FROM ${this.tableName} WHERE id = ?`,
        [id]
      );
      console.log(
        `🔍 DEBUG: Specific search for id ${id}:`,
        specificCheck.rows
      );
    }

    if (databaseManager.usePostgres) {
      return result.rows.length > 0 ? result.rows[0] : null;
    } else {
      return result.rows.length > 0 ? result.rows[0] : null;
    }
  }

  /**
   * Find records with conditions
   * @param {object} conditions - WHERE conditions
   * @param {object} options - Query options (limit, offset, orderBy)
   * @returns {Promise<array>} - Found records
   */
  async find(conditions = {}, options = {}) {
    let sql = `SELECT * FROM ${this.tableName}`;
    const params = [];
    let paramIndex = 1;

    // Build WHERE clause
    if (Object.keys(conditions).length > 0) {
      const whereClause = Object.keys(conditions)
        .map((key) => {
          params.push(conditions[key]);
          if (databaseManager.usePostgres) {
            return `${key} = $${paramIndex++}`;
          } else {
            return `${key} = ?`;
          }
        })
        .join(" AND ");

      sql += ` WHERE ${whereClause}`;
    }

    // Add ORDER BY
    if (options.orderBy) {
      sql += ` ORDER BY ${options.orderBy}`;
    }

    // Add LIMIT and OFFSET
    if (options.limit) {
      if (databaseManager.usePostgres) {
        sql += ` LIMIT $${paramIndex++}`;
      } else {
        sql += ` LIMIT ?`;
      }
      params.push(options.limit);
    }

    if (options.offset) {
      if (databaseManager.usePostgres) {
        sql += ` OFFSET $${paramIndex++}`;
      } else {
        sql += ` OFFSET ?`;
      }
      params.push(options.offset);
    }

    const result = await this.query(sql, params);
    return databaseManager.usePostgres ? result.rows : result.rows;
  }

  /**
   * Find one record with conditions
   * @param {object} conditions - WHERE conditions
   * @returns {Promise<object|null>} - Found record or null
   */
  async findOne(conditions = {}) {
    const records = await this.find(conditions, { limit: 1 });
    return records.length > 0 ? records[0] : null;
  }

  /**
   * Create new record
   * @param {object} data - Record data
   * @returns {Promise<object>} - Created record
   */
  async create(data) {
    const keys = Object.keys(data);
    const values = Object.values(data);
    let placeholders;
    
    if (databaseManager.usePostgres) {
      placeholders = keys.map((_, index) => `$${index + 1}`).join(", ");
    } else {
      placeholders = keys.map(() => "?").join(", ");
    }

    if (databaseManager.usePostgres) {
      const sql = `
        INSERT INTO ${this.tableName} (${keys.join(", ")})
        VALUES (${placeholders})
        RETURNING *
      `;
      const result = await this.query(sql, values);
      return result.rows[0];
    } else {
      // For SQLite, RETURNING is not supported, so we use a different approach
      const sql = `
        INSERT INTO ${this.tableName} (${keys.join(", ")})
        VALUES (${placeholders})
      `;
      const result = await this.query(sql, values);

      console.log(`SQLite INSERT result for ${this.tableName}:`, {
        lastID: result.lastID,
        changes: result.changes,
        resultType: typeof result,
        resultKeys: Object.keys(result),
      });

      // For SQLite with UUID primary keys, lastID is not reliable
      // Try to find by lastID first (for auto-increment), then fall back to latest record
      if (result.lastID) {
        console.log(`Finding user by lastID: ${result.lastID}`);
        const foundUser = await this.findById(result.lastID);
        if (foundUser) {
          console.log(`Found user by lastID:`, foundUser);
          return foundUser;
        }
        console.log("lastID search failed, trying latest record approach");
      }

      // Fallback: Get the latest record (works for UUID primary keys)
      console.log("Using latest record approach for UUID primary key");
      const latestSql = `SELECT * FROM ${this.tableName} ORDER BY created_at DESC LIMIT 1`;
      const latestResult = await this.query(latestSql);
      console.log("Latest record result:", latestResult);
      return latestResult.rows && latestResult.rows.length > 0
        ? latestResult.rows[0]
        : null;
    }
  }

  /**
   * Update record by ID
   * @param {string} id - Record ID
   * @param {object} data - Updated data
   * @returns {Promise<object|null>} - Updated record or null
   */
  async update(id, data) {
    const keys = Object.keys(data);
    const values = Object.values(data);
    let setClause;

    if (databaseManager.usePostgres) {
      setClause = keys
        .map((key, index) => `${key} = $${index + 2}`)
        .join(", ");
      const sql = `
        UPDATE ${this.tableName}
        SET ${setClause}, updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING *
      `;
      const result = await this.query(sql, [id, ...values]);
      return result.rows.length > 0 ? result.rows[0] : null;
    } else {
      setClause = keys.map((key) => `${key} = ?`).join(", ");
      const sql = `
        UPDATE ${this.tableName}
        SET ${setClause}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;
      const result = await this.query(sql, [...values, id]);
      return result.changes > 0 ? this.findById(id) : null;
    }
  }

  /**
   * Delete record by ID
   * @param {string} id - Record ID
   * @returns {Promise<boolean>} - True if deleted, false otherwise
   */
  async delete(id) {
    const sql = databaseManager.usePostgres 
      ? `DELETE FROM ${this.tableName} WHERE id = $1`
      : `DELETE FROM ${this.tableName} WHERE id = ?`;
    const result = await this.query(sql, [id]);

    if (databaseManager.usePostgres) {
      return result.rowCount > 0;
    } else {
      return result.changes > 0;
    }
  }

  /**
   * Count records with conditions
   * @param {object} conditions - WHERE conditions
   * @returns {Promise<number>} - Record count
   */
  async count(conditions = {}) {
    let sql = `SELECT COUNT(*) as count FROM ${this.tableName}`;
    const params = [];
    let paramIndex = 1;

    if (Object.keys(conditions).length > 0) {
      const whereClause = Object.keys(conditions)
        .map((key) => {
          params.push(conditions[key]);
          if (databaseManager.usePostgres) {
            return `${key} = $${paramIndex++}`;
          } else {
            return `${key} = ?`;
          }
        })
        .join(" AND ");

      sql += ` WHERE ${whereClause}`;
    }

    const result = await this.query(sql, params);

    if (databaseManager.usePostgres) {
      return parseInt(result.rows[0].count);
    } else {
      return parseInt(result.rows[0].count);
    }
  }

  /**
   * Check if record exists
   * @param {object} conditions - WHERE conditions
   * @returns {Promise<boolean>} - True if exists, false otherwise
   */
  async exists(conditions) {
    const count = await this.count(conditions);
    return count > 0;
  }

  /**
   * Execute transaction
   * @param {function} callback - Transaction callback
   * @returns {Promise} - Transaction result
   */
  async transaction(callback) {
    return this.db.transaction(callback);
  }

  /**
   * Build pagination metadata
   * @param {number} page - Current page
   * @param {number} limit - Records per page
   * @param {number} total - Total record count
   * @returns {object} - Pagination metadata
   */
  buildPagination(page, limit, total) {
    const totalPages = Math.ceil(total / limit);

    return {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };
  }
}

module.exports = {
  BaseModel,
  databaseManager,
};