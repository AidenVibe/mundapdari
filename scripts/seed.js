const config = require('../backend/src/config');
const databaseManager = require('../backend/src/config/database');
const User = require('../backend/src/models/User');
const Pair = require('../backend/src/models/Pair');
const Question = require('../backend/src/models/Question');
const Answer = require('../backend/src/models/Answer');
const encryptionService = require('../backend/src/utils/encryption');

class DatabaseSeeder {
  constructor() {
    this.isDevelopment = config.app.env === 'development';
  }

  /**
   * Run all seeders
   */
  async runSeeders() {
    try {
      console.log('🌱 Starting database seeding...');
      
      await databaseManager.initialize();

      // Seed in order due to dependencies
      await this.seedQuestions();
      
      if (this.isDevelopment) {
        await this.seedDevelopmentData();
      }

      console.log('🎉 Database seeding completed successfully');

    } catch (error) {
      console.error('💥 Seeding failed:', error.message);
      throw error;
    } finally {
      await databaseManager.close();
    }
  }

  /**
   * Seed questions if not already present
   */
  async seedQuestions() {
    try {
      console.log('📝 Seeding questions...');

      const existingQuestions = await Question.count();
      if (existingQuestions > 0) {
        console.log(`✅ Questions already exist (${existingQuestions} found)`);
        return;
      }

      const questions = [
        // Gratitude & Appreciation
        { content: '오늘 가장 감사했던 순간은 무엇인가요?', category: 'gratitude', order_num: 1 },
        { content: '최근에 누군가에게 고마움을 느낀 일이 있나요?', category: 'gratitude', order_num: 2 },
        { content: '우리 가족만의 특별한 전통이 있다면?', category: 'gratitude', order_num: 3 },
        
        // Childhood & Memories
        { content: '어린 시절 가장 좋아했던 간식은 무엇이었나요?', category: 'childhood', order_num: 4 },
        { content: '가족과 함께한 추억 중 가장 소중한 기억은?', category: 'childhood', order_num: 5 },
        { content: '어렸을 때 가장 무서워했던 것은 무엇인가요?', category: 'childhood', order_num: 6 },
        { content: '초등학교 때 가장 친했던 친구는 누구였나요?', category: 'childhood', order_num: 7 },
        
        // Daily Life & Current
        { content: '오늘 하루 중 가장 기뻤던 일은?', category: 'daily', order_num: 8 },
        { content: '요즘 가장 관심 있는 것은 무엇인가요?', category: 'daily', order_num: 9 },
        { content: '오늘 처음 해본 일이 있나요?', category: 'daily', order_num: 10 },
        { content: '지금 가장 듣고 싶은 말은 무엇인가요?', category: 'daily', order_num: 11 },
        
        // Dreams & Future
        { content: '요즘 새로 배우고 싶은 것이 있다면?', category: 'growth', order_num: 12 },
        { content: '10년 후 나는 어떤 모습일까요?', category: 'growth', order_num: 13 },
        { content: '올해 꼭 이루고 싶은 목표가 있나요?', category: 'growth', order_num: 14 },
        { content: '언젠가 가보고 싶은 곳이 있다면?', category: 'growth', order_num: 15 },
        
        // Feelings & Emotions
        { content: '어떤 순간에 가장 행복함을 느끼시나요?', category: 'feelings', order_num: 16 },
        { content: '힘들 때 가장 위로가 되는 것은?', category: 'feelings', order_num: 17 },
        { content: '화가 날 때는 어떻게 기분을 푸시나요?', category: 'feelings', order_num: 18 },
        { content: '가장 뿌듯했던 순간은 언제였나요?', category: 'feelings', order_num: 19 },
        
        // Preferences & Favorites
        { content: '가장 좋아하는 계절과 그 이유는?', category: 'preferences', order_num: 20 },
        { content: '어떤 음식을 먹을 때 가장 행복한가요?', category: 'preferences', order_num: 21 },
        { content: '가장 좋아하는 색깔과 그 이유는?', category: 'preferences', order_num: 22 },
        { content: '좋아하는 동물이 있다면 무엇인가요?', category: 'preferences', order_num: 23 },
        
        // Family & Relationships
        { content: '친구들에게 자랑하고 싶은 우리 가족만의 특별한 점은?', category: 'family', order_num: 24 },
        { content: '가족 중에서 가장 닮고 싶은 사람은 누구인가요?', category: 'family', order_num: 25 },
        { content: '집에서 가장 아늑한 공간은 어디인가요?', category: 'family', order_num: 26 },
        { content: '가족과 함께 하고 싶은 새로운 활동이 있나요?', category: 'family', order_num: 27 },
        
        // Fun & Imagination
        { content: '만약 하루 동안 슈퍼파워를 가질 수 있다면?', category: 'imagination', order_num: 28 },
        { content: '동화 속 주인공이 될 수 있다면 누가 되고 싶나요?', category: 'imagination', order_num: 29 },
        { content: '만약 시간여행이 가능하다면 언제로 가고 싶나요?', category: 'imagination', order_num: 30 },
        { content: '마법사가 된다면 첫 번째로 뭘 하고 싶나요?', category: 'imagination', order_num: 31 },
        
        // School & Learning
        { content: '학교에서 가장 좋아하는 과목은 무엇인가요?', category: 'learning', order_num: 32 },
        { content: '선생님께 감사인사를 전한다면?', category: 'learning', order_num: 33 },
        { content: '새로 배운 것 중 가장 신기했던 것은?', category: 'learning', order_num: 34 },
        
        // Achievements & Pride
        { content: '올해 가장 뿌듯했던 일은 무엇인가요?', category: 'achievement', order_num: 35 },
        { content: '최근에 칭찬받은 일이 있나요?', category: 'achievement', order_num: 36 },
        { content: '다른 사람을 도와준 경험이 있다면?', category: 'achievement', order_num: 37 },
        
        // Travel & Adventure
        { content: '가장 기억에 남는 여행지는 어디인가요?', category: 'travel', order_num: 38 },
        { content: '다음 가족여행으로 어디에 가고 싶나요?', category: 'travel', order_num: 39 },
        { content: '여행에서 가장 즐거웠던 순간은?', category: 'travel', order_num: 40 },
        
        // Special Occasions
        { content: '가장 기억에 남는 생일은 언제였나요?', category: 'special', order_num: 41 },
        { content: '크리스마스에 가장 받고 싶은 선물은?', category: 'special', order_num: 42 },
        { content: '새해에 꼭 해보고 싶은 일이 있나요?', category: 'special', order_num: 43 },
        
        // Comfort & Support
        { content: '속상할 때 가장 위로가 되는 말은?', category: 'comfort', order_num: 44 },
        { content: '아플 때 가장 먹고 싶은 음식은?', category: 'comfort', order_num: 45 },
        { content: '잠들기 전 가장 생각나는 것은?', category: 'comfort', order_num: 46 },
        
        // Future Dreams
        { content: '커서 어떤 일을 하고 싶나요?', category: 'dreams', order_num: 47 },
        { content: '어른이 되면 꼭 해보고 싶은 일은?', category: 'dreams', order_num: 48 },
        { content: '세상을 바꿀 수 있다면 무엇을 바꾸고 싶나요?', category: 'dreams', order_num: 49 },
        { content: '미래의 나에게 하고 싶은 말이 있다면?', category: 'dreams', order_num: 50 }
      ];

      let createdCount = 0;
      for (const questionData of questions) {
        try {
          await Question.create(questionData);
          createdCount++;
        } catch (error) {
          if (!error.message.includes('UNIQUE constraint failed')) {
            console.error(`Failed to create question: ${questionData.content}`, error.message);
          }
        }
      }

      console.log(`✅ Created ${createdCount} questions`);

    } catch (error) {
      console.error('❌ Failed to seed questions:', error);
      throw error;
    }
  }

  /**
   * Seed development data (users, pairs, answers)
   */
  async seedDevelopmentData() {
    try {
      console.log('👥 Seeding development data...');

      // Check if dev data already exists
      const existingUsers = await User.count();
      if (existingUsers > 0) {
        console.log(`✅ Development data already exists (${existingUsers} users found)`);
        return;
      }

      // Create test users
      const parentUser = await User.create({
        phone: '+821012345678',
        name: '김민준',
        role: 'parent'
      });

      const childUser = await User.create({
        phone: '+821087654321', 
        name: '김지우',
        role: 'child'
      });

      console.log('✅ Created test users');

      // Create active pair
      const pair = await Pair.create({
        parent_id: parentUser.id,
        child_id: childUser.id,
      });

      // Immediately activate the pair (skip invitation process for dev)
      await Pair.update(pair.id, {
        status: 'active',
        invitation_token: null,
        invitation_expires_at: null,
      });

      console.log('✅ Created test pair');

      // Create some sample answers
      const questions = await Question.find({ active: true }, { limit: 5 });
      
      if (questions.length > 0) {
        const sampleAnswers = [
          {
            question_id: questions[0].id,
            user_id: parentUser.id,
            pair_id: pair.id,
            content: '오늘 아침에 지우가 스스로 일어나서 준비하는 모습을 보고 정말 뿌듯했어요!'
          },
          {
            question_id: questions[0].id,
            user_id: childUser.id,
            pair_id: pair.id,
            content: '아빠가 제가 좋아하는 간식을 사와주신 것이 가장 감사했어요 😊'
          },
          {
            question_id: questions[1]?.id,
            user_id: parentUser.id,
            pair_id: pair.id,
            content: '어렸을 때 엄마가 만들어주신 계란말이를 가장 좋아했어요. 지금도 가끔 생각나네요.'
          }
        ];

        let answerCount = 0;
        for (const answerData of sampleAnswers) {
          if (answerData.question_id) {
            try {
              await Answer.create(answerData);
              answerCount++;
            } catch (error) {
              console.error('Failed to create sample answer:', error.message);
            }
          }
        }

        console.log(`✅ Created ${answerCount} sample answers`);
      }

      console.log('🎭 Development data seeding completed');
      console.log('📱 Test credentials:');
      console.log(`   Parent: ${parentUser.name} (${parentUser.phone_masked})`);
      console.log(`   Child: ${childUser.name} (${childUser.phone_masked})`);

    } catch (error) {
      console.error('❌ Failed to seed development data:', error);
      throw error;
    }
  }

  /**
   * Clear all data
   */
  async clearData() {
    try {
      console.log('🧹 Clearing all data...');
      
      await databaseManager.initialize();

      // Clear in reverse dependency order
      const tables = [
        'weekly_summaries',
        'streaks',
        'reactions', 
        'answers',
        'pairs',
        'users',
        'questions'
      ];

      for (const table of tables) {
        try {
          await databaseManager.query(`DELETE FROM ${table}`);
          console.log(`🗑️  Cleared table: ${table}`);
        } catch (error) {
          console.log(`⚠️  Could not clear table ${table}: ${error.message}`);
        }
      }

      console.log('✅ All data cleared');

    } catch (error) {
      console.error('❌ Failed to clear data:', error);
      throw error;
    } finally {
      await databaseManager.close();
    }
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'run';

  const seeder = new DatabaseSeeder();

  switch (command) {
    case 'run':
      await seeder.runSeeders();
      break;
    case 'questions':
      await databaseManager.initialize();
      await seeder.seedQuestions();
      await databaseManager.close();
      break;
    case 'dev':
      await databaseManager.initialize();
      await seeder.seedDevelopmentData();
      await databaseManager.close();
      break;
    case 'clear':
      if (args.includes('--confirm')) {
        await seeder.clearData();
      } else {
        console.log('⚠️  This will delete all data. Use --confirm flag to proceed.');
        console.log('Example: npm run db:seed clear --confirm');
      }
      break;
    default:
      console.log('Usage:');
      console.log('  npm run db:seed           # Run all seeders');
      console.log('  npm run db:seed questions # Seed questions only');
      console.log('  npm run db:seed dev       # Seed development data only');
      console.log('  npm run db:seed clear --confirm # Clear all data');
      break;
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('💥 Seeding failed:', error);
    process.exit(1);
  });
}

module.exports = DatabaseSeeder;