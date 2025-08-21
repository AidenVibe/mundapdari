const { BaseModel } = require('./index');
const logger = require('../utils/logger');

class Question extends BaseModel {
  constructor() {
    super('questions');
  }

  /**
   * Get today's question for a pair
   * @param {string} pairId - Pair ID
   * @returns {Promise<object|null>} - Today's question or null
   */
  async getTodaysQuestion(pairId = null) {
    try {
      // Get current date in YYYY-MM-DD format
      const today = new Date().toISOString().split('T')[0];
      
      // Calculate day number since epoch to ensure consistent daily questions
      const dayNumber = Math.floor(new Date(today).getTime() / (1000 * 60 * 60 * 24));
      
      // Get total number of active questions
      const totalQuestions = await this.count({ active: true });
      
      if (totalQuestions === 0) {
        logger.warn('No active questions found');
        return null;
      }

      // Use modulo to cycle through questions
      const questionIndex = dayNumber % totalQuestions;
      
      // Get the question at the calculated index
      const questions = await this.find(
        { active: true },
        { 
          orderBy: 'order_num ASC, created_at ASC',
          limit: 1,
          offset: questionIndex 
        }
      );

      if (questions.length === 0) {
        logger.warn('Failed to get today\'s question');
        return null;
      }

      const question = questions[0];
      
      // If pairId is provided, also get answers for this question from the pair
      if (pairId) {
        const sql = `
          SELECT 
            a.*,
            u.name as user_name,
            u.role as user_role
          FROM answers a
          JOIN users u ON a.user_id = u.id
          WHERE a.question_id = $1 AND a.pair_id = $2
          ORDER BY a.answered_at ASC
        `;

        const answerResult = await this.query(sql, [question.id, pairId]);
        question.answers = answerResult.rows || answerResult.rows;
      }

      return question;
    } catch (error) {
      logger.error('Failed to get today\'s question:', error);
      throw error;
    }
  }

  /**
   * Get question by ID with optional answers
   * @param {string} questionId - Question ID
   * @param {string} pairId - Pair ID (optional)
   * @returns {Promise<object|null>} - Question with answers or null
   */
  async findByIdWithAnswers(questionId, pairId = null) {
    try {
      const question = await this.findById(questionId);
      
      if (!question) {
        return null;
      }

      // Get answers for this question
      let sql = `
        SELECT 
          a.*,
          u.name as user_name,
          u.role as user_role
        FROM answers a
        JOIN users u ON a.user_id = u.id
        WHERE a.question_id = $1
      `;

      const params = [questionId];

      // Filter by pair if provided
      if (pairId) {
        sql += ' AND a.pair_id = $2';
        params.push(pairId);
      }

      sql += ' ORDER BY a.answered_at ASC';

      const answerResult = await this.query(sql, params);
      question.answers = answerResult.rows || answerResult.rows;

      return question;
    } catch (error) {
      logger.error('Failed to find question with answers:', error);
      throw error;
    }
  }

  /**
   * Get questions by category
   * @param {string} category - Question category
   * @param {object} options - Query options
   * @returns {Promise<array>} - Questions in category
   */
  async findByCategory(category, options = {}) {
    try {
      return await this.find(
        { category, active: true },
        {
          orderBy: 'order_num ASC, created_at ASC',
          ...options
        }
      );
    } catch (error) {
      logger.error('Failed to find questions by category:', error);
      throw error;
    }
  }

  /**
   * Get all active questions with pagination
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   * @returns {Promise<object>} - Paginated questions
   */
  async findActivePaginated(page = 1, limit = 10) {
    try {
      const offset = (page - 1) * limit;
      const total = await this.count({ active: true });

      const questions = await this.find(
        { active: true },
        {
          orderBy: 'order_num ASC, created_at ASC',
          limit,
          offset
        }
      );

      return {
        questions,
        pagination: this.buildPagination(page, limit, total)
      };
    } catch (error) {
      logger.error('Failed to find active questions:', error);
      throw error;
    }
  }

  /**
   * Create new question
   * @param {object} questionData - Question data
   * @returns {Promise<object>} - Created question
   */
  async create(questionData) {
    try {
      // Set order number if not provided
      if (!questionData.order_num) {
        const maxOrder = await this.getMaxOrderNumber();
        questionData.order_num = maxOrder + 1;
      }

      const data = {
        ...questionData,
        active: questionData.active !== undefined ? questionData.active : true,
        created_at: new Date().toISOString(),
      };

      const question = await super.create(data);
      logger.info('Question created', { questionId: question.id, category: question.category });

      return question;
    } catch (error) {
      logger.error('Failed to create question:', error);
      throw error;
    }
  }

  /**
   * Update question order
   * @param {string} questionId - Question ID
   * @param {number} newOrder - New order number
   * @returns {Promise<object|null>} - Updated question or null
   */
  async updateOrder(questionId, newOrder) {
    try {
      return await this.update(questionId, { order_num: newOrder });
    } catch (error) {
      logger.error('Failed to update question order:', error);
      throw error;
    }
  }

  /**
   * Activate/deactivate question
   * @param {string} questionId - Question ID
   * @param {boolean} active - Active status
   * @returns {Promise<object|null>} - Updated question or null
   */
  async setActive(questionId, active) {
    try {
      const updated = await this.update(questionId, { active });
      
      if (updated) {
        logger.info(`Question ${active ? 'activated' : 'deactivated'}`, { questionId });
      }

      return updated;
    } catch (error) {
      logger.error('Failed to set question active status:', error);
      throw error;
    }
  }

  /**
   * Get question categories
   * @returns {Promise<array>} - Available categories
   */
  async getCategories() {
    try {
      const sql = `
        SELECT DISTINCT category, COUNT(*) as question_count
        FROM ${this.tableName}
        WHERE active = true AND category IS NOT NULL
        GROUP BY category
        ORDER BY category ASC
      `;

      const result = await this.query(sql);
      return result.rows || result.rows;
    } catch (error) {
      logger.error('Failed to get question categories:', error);
      throw error;
    }
  }

  /**
   * Get maximum order number
   * @returns {Promise<number>} - Maximum order number
   */
  async getMaxOrderNumber() {
    try {
      const sql = `SELECT COALESCE(MAX(order_num), 0) as max_order FROM ${this.tableName}`;
      const result = await this.query(sql);
      
      const maxOrder = result.rows ? result.rows[0].max_order : result.rows[0].max_order;
      return parseInt(maxOrder) || 0;
    } catch (error) {
      logger.error('Failed to get max order number:', error);
      return 0;
    }
  }

  /**
   * Get question statistics
   * @param {string} questionId - Question ID (optional)
   * @returns {Promise<object>} - Question statistics
   */
  async getQuestionStats(questionId = null) {
    try {
      let sql = `
        SELECT 
          COUNT(DISTINCT a.id) as total_answers,
          COUNT(DISTINCT a.pair_id) as pairs_answered,
          COUNT(DISTINCT r.id) as total_reactions,
          AVG(LENGTH(a.content)) as avg_answer_length
        FROM ${this.tableName} q
        LEFT JOIN answers a ON q.id = a.question_id
        LEFT JOIN reactions r ON a.id = r.answer_id
      `;

      const params = [];

      if (questionId) {
        sql += ' WHERE q.id = $1';
        params.push(questionId);
      } else {
        sql += ' WHERE q.active = true';
      }

      sql += ' GROUP BY q.id';

      const result = await this.query(sql, params);
      
      if (result.rows && result.rows.length > 0) {
        const stats = result.rows[0];
        return {
          totalAnswers: parseInt(stats.total_answers) || 0,
          pairsAnswered: parseInt(stats.pairs_answered) || 0,
          totalReactions: parseInt(stats.total_reactions) || 0,
          avgAnswerLength: parseFloat(stats.avg_answer_length) || 0,
        };
      }

      return {
        totalAnswers: 0,
        pairsAnswered: 0,
        totalReactions: 0,
        avgAnswerLength: 0,
      };
    } catch (error) {
      logger.error('Failed to get question stats:', error);
      throw error;
    }
  }

  /**
   * Search questions by content
   * @param {string} searchTerm - Search term
   * @param {object} options - Search options
   * @returns {Promise<array>} - Matching questions
   */
  async search(searchTerm, options = {}) {
    try {
      const sql = `
        SELECT *
        FROM ${this.tableName}
        WHERE active = true
          AND (content ILIKE $1 OR category ILIKE $1)
        ORDER BY order_num ASC, created_at ASC
        ${options.limit ? `LIMIT ${options.limit}` : ''}
      `;

      const result = await this.query(sql, [`%${searchTerm}%`]);
      return result.rows || result.rows;
    } catch (error) {
      logger.error('Failed to search questions:', error);
      throw error;
    }
  }
}

module.exports = new Question();