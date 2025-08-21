const MigrationRunner = require('./migrate');
const DatabaseSeeder = require('./seed');

class DatabaseResetManager {
  constructor() {
    this.migrationRunner = new MigrationRunner();
    this.seeder = new DatabaseSeeder();
  }

  /**
   * Complete database reset and setup
   */
  async resetAndSetup() {
    try {
      console.log('🔄 Starting complete database reset...');
      
      // Step 1: Reset (drop all tables)
      console.log('\n📍 Step 1: Dropping all tables...');
      await this.migrationRunner.reset();
      
      // Step 2: Run migrations
      console.log('\n📍 Step 2: Running migrations...');
      await this.migrationRunner.runMigrations();
      
      // Step 3: Seed data
      console.log('\n📍 Step 3: Seeding data...');
      await this.seeder.runSeeders();
      
      console.log('\n🎉 Database reset and setup completed successfully!');
      console.log('\n📋 Summary:');
      console.log('   ✅ All tables dropped');
      console.log('   ✅ Fresh schema created'); 
      console.log('   ✅ Initial data seeded');
      
      if (process.env.NODE_ENV === 'development') {
        console.log('   ✅ Development test data created');
        console.log('\n👤 Test Users:');
        console.log('      Parent: 김민준 (+82***-****-5678)');
        console.log('      Child: 김지우 (+82***-****-4321)');
      }

    } catch (error) {
      console.error('\n💥 Database reset failed:', error.message);
      throw error;
    }
  }

  /**
   * Reset without confirmation (for scripts)
   */
  async forceReset() {
    return this.resetAndSetup();
  }

  /**
   * Interactive reset with confirmation
   */
  async interactiveReset() {
    const readline = require('readline');
    
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    return new Promise((resolve, reject) => {
      console.log('⚠️  WARNING: This will completely reset the database!');
      console.log('   - All existing data will be permanently lost');
      console.log('   - All tables will be dropped and recreated');
      console.log('   - Fresh seed data will be inserted');
      
      rl.question('\nAre you sure you want to continue? (type "yes" to confirm): ', async (answer) => {
        rl.close();
        
        if (answer.toLowerCase() === 'yes') {
          try {
            await this.resetAndSetup();
            resolve();
          } catch (error) {
            reject(error);
          }
        } else {
          console.log('❌ Database reset cancelled');
          resolve();
        }
      });
    });
  }

  /**
   * Development quick reset
   */
  async devReset() {
    try {
      console.log('🔧 Development database reset...');
      
      // Clear data only (keep schema)
      await this.seeder.clearData();
      
      // Re-seed
      await this.seeder.runSeeders();
      
      console.log('✅ Development reset completed');

    } catch (error) {
      console.error('❌ Development reset failed:', error.message);
      throw error;
    }
  }

  /**
   * Production safe reset (migrations only)
   */
  async prodReset() {
    try {
      console.log('🏭 Production-safe database setup...');
      console.log('   (Running migrations only, no data clearing)');
      
      // Only run migrations, don't drop existing data
      await this.migrationRunner.runMigrations();
      
      console.log('✅ Production setup completed');

    } catch (error) {
      console.error('❌ Production setup failed:', error.message);
      throw error;
    }
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'interactive';
  const hasConfirm = args.includes('--confirm');
  const resetManager = new DatabaseResetManager();

  try {
    switch (command) {
      case 'interactive':
        if (hasConfirm) {
          await resetManager.forceReset();
        } else {
          await resetManager.interactiveReset();
        }
        break;
        
      case 'force':
        await resetManager.forceReset();
        break;
        
      case 'dev':
        await resetManager.devReset();
        break;
        
      case 'prod':
        await resetManager.prodReset();
        break;
        
      default:
        console.log('🔄 Database Reset Manager');
        console.log('=========================\n');
        console.log('Usage:');
        console.log('  npm run db:reset                  # Interactive reset with confirmation');
        console.log('  npm run db:reset -- --confirm     # Force reset without prompt');
        console.log('  npm run db:reset force            # Force reset without prompt');
        console.log('  npm run db:reset dev              # Development reset (clear data only)');
        console.log('  npm run db:reset prod             # Production safe (migrations only)');
        console.log('\nCommands:');
        console.log('  interactive  - Ask for confirmation before reset');
        console.log('  force        - Reset without confirmation');
        console.log('  dev          - Clear and re-seed data only');
        console.log('  prod         - Run migrations only (safe for production)');
        break;
    }
  } catch (error) {
    console.error('💥 Reset operation failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  });
}

module.exports = DatabaseResetManager;