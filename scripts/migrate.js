const fs = require('fs');
const path = require('path');
const config = require('../backend/src/config');
const databaseManager = require('../backend/src/config/database');

class MigrationRunner {
  constructor() {
    this.migrationsPath = path.join(__dirname, '../database/migrations');
    this.isPostgres = config.app.env === 'production' || config.app.env === 'staging';
  }

  /**
   * Get all migration files
   */
  getMigrationFiles() {
    try {
      const files = fs.readdirSync(this.migrationsPath)
        .filter(file => {
          if (this.isPostgres) {
            return file.endsWith('.sql') && !file.includes('sqlite');
          } else {
            return file.endsWith('.sql') && (file.includes('sqlite') || !file.includes('postgres'));
          }
        })
        .sort();
      
      return files.map(file => ({
        filename: file,
        path: path.join(this.migrationsPath, file),
      }));
    } catch (error) {
      console.error('❌ Error reading migration files:', error.message);
      return [];
    }
  }

  /**
   * Create migrations tracking table
   */
  async createMigrationsTable() {
    const sql = `
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version VARCHAR(255) PRIMARY KEY,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    try {
      await databaseManager.query(sql);
      console.log('✅ Migrations tracking table ready');
    } catch (error) {
      console.error('❌ Failed to create migrations table:', error.message);
      throw error;
    }
  }

  /**
   * Get executed migrations
   */
  async getExecutedMigrations() {
    try {
      const result = await databaseManager.query('SELECT version FROM schema_migrations ORDER BY version');
      return (result.rows || result.rows || []).map(row => row.version);
    } catch (error) {
      // If table doesn't exist, return empty array
      if (error.message.includes('no such table') || error.message.includes('does not exist')) {
        return [];
      }
      throw error;
    }
  }

  /**
   * Mark migration as executed
   */
  async markMigrationExecuted(version) {
    const sql = 'INSERT INTO schema_migrations (version) VALUES ($1)';
    await databaseManager.query(sql, [version]);
  }

  /**
   * Process SQL content for database type
   */
  processSqlContent(content) {
    // Replace placeholders
    let processedContent = content.replace(/\{\{DB_TYPE\}\}/g, this.isPostgres ? 'postgresql' : 'sqlite');
    
    if (!this.isPostgres) {
      // SQLite specific modifications
      processedContent = processedContent
        // Remove PostgreSQL-specific extensions
        .replace(/CREATE EXTENSION[^;]+;/gi, '')
        // Replace UUID generation with simple text for SQLite
        .replace(/uuid_generate_v4\(\)/g, "lower(hex(randomblob(4)) || '-' || hex(randomblob(2)) || '-4' || substr(hex(randomblob(2)),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(hex(randomblob(2)),2) || '-' || hex(randomblob(6)))")
        // Remove PostgreSQL DO blocks
        .replace(/DO \$\$[\s\S]*?\$\$;/gi, '')
        // Replace PostgreSQL specific SQL
        .replace(/CREATE INDEX CONCURRENTLY/gi, 'CREATE INDEX')
        // Replace INSERT OR IGNORE (SQLite) vs ON CONFLICT DO NOTHING (PostgreSQL)
        .replace(/INSERT OR IGNORE/gi, 'INSERT OR IGNORE');
    } else {
      // PostgreSQL specific modifications
      processedContent = processedContent
        // Replace SQLite INSERT OR IGNORE with PostgreSQL equivalent
        .replace(/INSERT OR IGNORE/gi, 'INSERT ... ON CONFLICT DO NOTHING');
    }

    return processedContent;
  }

  /**
   * Execute a single migration
   */
  async executeMigration(migration) {
    try {
      console.log(`📄 Executing migration: ${migration.filename}`);
      
      const sqlContent = fs.readFileSync(migration.path, 'utf8');
      const processedSql = this.processSqlContent(sqlContent);
      
      // Split SQL by statements (simple approach)
      const statements = processedSql
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

      // Execute statements
      for (const statement of statements) {
        if (statement.trim()) {
          try {
            if (databaseManager.usePostgres) {
              await databaseManager.query(statement);
            } else {
              await databaseManager.runSQLite(statement);
            }
          } catch (error) {
            // Ignore some specific errors that are expected
            if (error.message.includes('already exists') || 
                error.message.includes('duplicate key') ||
                error.message.includes('UNIQUE constraint failed')) {
              console.log(`⚠️  Skipping: ${error.message.split('\n')[0]}`);
              continue;
            }
            throw error;
          }
        }
      }

      // Mark as executed
      const version = migration.filename.replace('.sql', '');
      await this.markMigrationExecuted(version);
      
      console.log(`✅ Migration completed: ${migration.filename}`);
    } catch (error) {
      console.error(`❌ Migration failed: ${migration.filename}`);
      console.error('Error:', error.message);
      throw error;
    }
  }

  /**
   * Run all pending migrations
   */
  async runMigrations() {
    try {
      console.log('🚀 Starting database migration...');
      console.log(`📊 Database type: ${this.isPostgres ? 'PostgreSQL' : 'SQLite'}`);
      
      // Initialize database connection
      await databaseManager.initialize();
      
      // Create migrations table
      await this.createMigrationsTable();
      
      // Get all migrations
      const migrations = this.getMigrationFiles();
      if (migrations.length === 0) {
        console.log('📭 No migration files found');
        return;
      }

      // Get executed migrations
      const executedMigrations = await this.getExecutedMigrations();
      console.log(`📋 Found ${executedMigrations.length} executed migrations`);

      // Find pending migrations
      const pendingMigrations = migrations.filter(migration => {
        const version = migration.filename.replace('.sql', '');
        return !executedMigrations.includes(version);
      });

      if (pendingMigrations.length === 0) {
        console.log('✅ All migrations are up to date');
        return;
      }

      console.log(`📦 Found ${pendingMigrations.length} pending migrations`);

      // Execute pending migrations
      for (const migration of pendingMigrations) {
        await this.executeMigration(migration);
      }

      console.log('🎉 All migrations completed successfully');

    } catch (error) {
      console.error('💥 Migration failed:', error.message);
      process.exit(1);
    } finally {
      // Close database connection
      await databaseManager.close();
    }
  }

  /**
   * Show migration status
   */
  async showStatus() {
    try {
      await databaseManager.initialize();
      await this.createMigrationsTable();

      const migrations = this.getMigrationFiles();
      const executedMigrations = await this.getExecutedMigrations();

      console.log('\n📊 Migration Status');
      console.log('==================');
      console.log(`Database: ${this.isPostgres ? 'PostgreSQL' : 'SQLite'}`);
      console.log(`Total migrations: ${migrations.length}`);
      console.log(`Executed: ${executedMigrations.length}`);
      console.log(`Pending: ${migrations.length - executedMigrations.length}\n`);

      if (migrations.length > 0) {
        console.log('Migrations:');
        migrations.forEach(migration => {
          const version = migration.filename.replace('.sql', '');
          const status = executedMigrations.includes(version) ? '✅ Executed' : '⏳ Pending';
          console.log(`  ${status} ${migration.filename}`);
        });
      }

    } catch (error) {
      console.error('❌ Failed to show status:', error.message);
    } finally {
      await databaseManager.close();
    }
  }

  /**
   * Reset database (drop all tables)
   */
  async reset() {
    try {
      console.log('⚠️  Resetting database...');
      
      await databaseManager.initialize();

      // Drop tables in reverse dependency order
      const dropTables = [
        'weekly_summaries',
        'streaks', 
        'reactions',
        'answers',
        'questions',
        'pairs',
        'users',
        'schema_migrations'
      ];

      for (const table of dropTables) {
        try {
          await databaseManager.query(`DROP TABLE IF EXISTS ${table} CASCADE`);
          console.log(`🗑️  Dropped table: ${table}`);
        } catch (error) {
          console.log(`⚠️  Could not drop table ${table}: ${error.message}`);
        }
      }

      console.log('🧹 Database reset completed');

    } catch (error) {
      console.error('❌ Reset failed:', error.message);
    } finally {
      await databaseManager.close();
    }
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'up';

  const runner = new MigrationRunner();

  switch (command) {
    case 'up':
      await runner.runMigrations();
      break;
    case 'status':
      await runner.showStatus();
      break;
    case 'reset':
      if (args.includes('--confirm')) {
        await runner.reset();
      } else {
        console.log('⚠️  This will delete all data. Use --confirm flag to proceed.');
        console.log('Example: npm run db:reset -- --confirm');
      }
      break;
    default:
      console.log('Usage:');
      console.log('  npm run db:migrate        # Run pending migrations');
      console.log('  npm run db:migrate status # Show migration status');
      console.log('  npm run db:reset --confirm # Reset database (destructive!)');
      break;
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  });
}

module.exports = MigrationRunner;