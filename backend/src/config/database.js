const { Pool } = require('pg');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const config = require('./index');

class DatabaseManager {
  constructor() {
    this.pool = null;
    this.sqlite = null;
    this.isProduction = config.app.env === 'production';
    this.usePostgres = this.isProduction || config.app.env === 'staging';
  }

  async initialize() {
    if (this.usePostgres) {
      await this.initializePostgreSQL();
    } else {
      await this.initializeSQLite();
    }
  }

  async initializePostgreSQL() {
    try {
      this.pool = new Pool(config.database.postgres);

      // Test connection
      const client = await this.pool.connect();
      await client.query('SELECT NOW()');
      client.release();

      console.log('✅ PostgreSQL database connected successfully');

      // Setup connection error handling
      this.pool.on('error', (err) => {
        console.error('❌ Unexpected error on idle PostgreSQL client', err);
        process.exit(-1);
      });
    } catch (error) {
      console.error('❌ Error connecting to PostgreSQL:', error);
      throw error;
    }
  }

  async initializeSQLite() {
    try {
      // Ensure database directory exists
      const dbPath = config.database.sqlite.filename;
      const dbDir = path.dirname(dbPath);

      console.log('🔍 SQLite Debug Info:');
      console.log('  - Raw config path:', config.database.sqlite.filename);
      console.log('  - Resolved path:', path.resolve(dbPath));
      console.log('  - Working directory:', process.cwd());
      console.log('  - Directory exists:', fs.existsSync(dbDir));
      console.log('  - File exists before:', fs.existsSync(dbPath));

      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
        console.log('  - Created directory:', dbDir);
      }

      this.sqlite = new sqlite3.Database(dbPath, (err) => {
        if (err) {
          console.error('❌ Error opening SQLite database:', err);
          throw err;
        }
        console.log('✅ SQLite database connected successfully');
        console.log('  - Final database path:', dbPath);
        console.log('  - File exists after:', fs.existsSync(dbPath));
        
        // Test table existence immediately after connection
        this.sqlite.all("SELECT name FROM sqlite_master WHERE type='table';", (err, rows) => {
          if (err) {
            console.error('❌ Error checking tables:', err);
          } else {
            console.log('  - Tables found:', rows.map(r => r.name));
          }
        });
      });

      // Enable foreign keys
      await this.runSQLite('PRAGMA foreign_keys = ON');

      // Setup WAL mode for better performance
      await this.runSQLite('PRAGMA journal_mode = WAL');
    } catch (error) {
      console.error('❌ Error initializing SQLite:', error);
      throw error;
    }
  }

  // PostgreSQL query method
  async query(text, params = []) {
    if (this.usePostgres) {
      const client = await this.pool.connect();
      try {
        const result = await client.query(text, params);
        return result;
      } finally {
        client.release();
      }
    } else {
      return this.querySQLite(text, params);
    }
  }

  // SQLite query methods
  runSQLite(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.sqlite.run(sql, params, function (err) {
        if (err) {
          reject(err);
        } else {
          resolve({ changes: this.changes, lastID: this.lastID });
        }
      });
    });
  }

  getSQLite(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.sqlite.get(sql, params, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  allSQLite(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.sqlite.all(sql, params, (err, rows) => {
        if (err) {
          console.error('🔍 SQLite Query Error:', {
            sql: sql.substring(0, 100),
            error: err.message,
            code: err.code
          });
          reject(err);
        } else {
          resolve({ rows });
        }
      });
    });
  }

  async querySQLite(sql, params = []) {
    // Determine query type and call appropriate method
    const queryType = sql.trim().toUpperCase().split(' ')[0];

    switch (queryType) {
      case 'SELECT':
        return this.allSQLite(sql, params);
      case 'INSERT':
      case 'UPDATE':
      case 'DELETE':
        return this.runSQLite(sql, params);
      default:
        return this.runSQLite(sql, params);
    }
  }

  // Transaction support
  async transaction(callback) {
    if (this.usePostgres) {
      const client = await this.pool.connect();
      try {
        await client.query('BEGIN');
        const result = await callback(client);
        await client.query('COMMIT');
        return result;
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } else {
      return new Promise((resolve, reject) => {
        this.sqlite.serialize(() => {
          this.sqlite.run('BEGIN TRANSACTION');

          callback(this.sqlite)
            .then((result) => {
              this.sqlite.run('COMMIT', (err) => {
                if (err) reject(err);
                else resolve(result);
              });
            })
            .catch((error) => {
              this.sqlite.run('ROLLBACK', () => {
                reject(error);
              });
            });
        });
      });
    }
  }

  // Health check
  async healthCheck() {
    try {
      if (this.usePostgres) {
        await this.query('SELECT 1');
      } else {
        await this.querySQLite('SELECT 1');
      }
      return {
        status: 'healthy',
        database: this.usePostgres ? 'postgresql' : 'sqlite',
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        database: this.usePostgres ? 'postgresql' : 'sqlite',
      };
    }
  }

  // Graceful shutdown
  async close() {
    try {
      if (this.usePostgres && this.pool) {
        await this.pool.end();
        console.log('📴 PostgreSQL connection pool closed');
      }

      if (!this.usePostgres && this.sqlite) {
        await new Promise((resolve) => {
          this.sqlite.close((err) => {
            if (err) console.error('Error closing SQLite:', err);
            else console.log('📴 SQLite database closed');
            resolve();
          });
        });
      }
    } catch (error) {
      console.error('Error during database shutdown:', error);
    }
  }
}

// Singleton instance
const databaseManager = new DatabaseManager();

module.exports = databaseManager;