const { BaseModel } = require('./index');
const logger = require('../utils/logger');

class Answer extends BaseModel {
  constructor() {
    super('answers');
  }

  /**
   * Create new answer
   * @param {object} answerData - Answer data
   * @returns {Promise<object>} - Created answer
   */
  async create(answerData) {
    try {
      const data = {
        ...answerData,
        answered_at: new Date().toISOString(),
      };

      const answer = await super.create(data);
      logger.info('Answer created', { 
        answerId: answer.id, 
        questionId: answer.question_id,
        userId: answer.user_id 
      });

      return answer;
    } catch (error) {
      logger.error('Failed to create answer:', error);
      throw error;
    }
  }

  /**
   * Update answer content
   * @param {string} answerId - Answer ID
   * @param {string} content - New content
   * @param {string} userId - User ID (for ownership verification)
   * @returns {Promise<object|null>} - Updated answer or null
   */
  async updateContent(answerId, content, userId) {
    try {
      // First verify ownership
      const answer = await this.findById(answerId);
      
      if (!answer) {
        throw new Error('Answer not found');
      }

      if (answer.user_id !== userId) {
        throw new Error('Not authorized to update this answer');
      }

      const updated = await this.update(answerId, { 
        content,
        updated_at: new Date().toISOString()
      });

      if (updated) {
        logger.info('Answer updated', { answerId, userId });
      }

      return updated;
    } catch (error) {
      logger.error('Failed to update answer:', error);
      throw error;
    }
  }

  /**
   * Find answers for a question by pair
   * @param {string} questionId - Question ID
   * @param {string} pairId - Pair ID
   * @returns {Promise<array>} - Answers with user info
   */
  async findByQuestionAndPair(questionId, pairId) {
    try {
      const sql = `
        SELECT 
          a.*,
          u.name as user_name,
          u.role as user_role,
          COUNT(r.id) as reaction_count
        FROM ${this.tableName} a
        JOIN users u ON a.user_id = u.id
        LEFT JOIN reactions r ON a.id = r.answer_id
        WHERE a.question_id = $1 AND a.pair_id = $2
        GROUP BY a.id, u.id, u.name, u.role
        ORDER BY a.answered_at ASC
      `;

      const result = await this.query(sql, [questionId, pairId]);
      const answers = result.rows || result.rows;

      // Get reactions for each answer
      for (const answer of answers) {
        answer.reactions = await this.getAnswerReactions(answer.id);
      }

      return answers;
    } catch (error) {
      logger.error('Failed to find answers by question and pair:', error);
      throw error;
    }
  }

  /**
   * Find user's answer for a specific question
   * @param {string} questionId - Question ID
   * @param {string} userId - User ID
   * @param {string} pairId - Pair ID
   * @returns {Promise<object|null>} - User's answer or null
   */
  async findUserAnswer(questionId, userId, pairId) {
    try {
      const sql = `
        SELECT a.*, u.name as user_name, u.role as user_role
        FROM ${this.tableName} a
        JOIN users u ON a.user_id = u.id
        WHERE a.question_id = $1 AND a.user_id = $2 AND a.pair_id = $3
        LIMIT 1
      `;

      const result = await this.query(sql, [questionId, userId, pairId]);
      const answer = result.rows && result.rows.length > 0 ? result.rows[0] : null;

      if (answer) {
        answer.reactions = await this.getAnswerReactions(answer.id);
      }

      return answer;
    } catch (error) {
      logger.error('Failed to find user answer:', error);
      throw error;
    }
  }

  /**
   * Check if user has already answered a question
   * @param {string} questionId - Question ID
   * @param {string} userId - User ID
   * @param {string} pairId - Pair ID
   * @returns {Promise<boolean>} - True if answered, false otherwise
   */
  async hasUserAnswered(questionId, userId, pairId) {
    try {
      const answer = await this.findUserAnswer(questionId, userId, pairId);
      return answer !== null;
    } catch (error) {
      logger.error('Failed to check if user has answered:', error);
      throw error;
    }
  }

  /**
   * Get answers for a pair with pagination
   * @param {string} pairId - Pair ID
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   * @returns {Promise<object>} - Paginated answers
   */
  async findByPairPaginated(pairId, page = 1, limit = 10) {
    try {
      const offset = (page - 1) * limit;
      const total = await this.count({ pair_id: pairId });

      const sql = `
        SELECT 
          a.*,
          u.name as user_name,
          u.role as user_role,
          q.content as question_content,
          q.category as question_category,
          COUNT(r.id) as reaction_count
        FROM ${this.tableName} a
        JOIN users u ON a.user_id = u.id
        JOIN questions q ON a.question_id = q.id
        LEFT JOIN reactions r ON a.id = r.answer_id
        WHERE a.pair_id = $1
        GROUP BY a.id, u.id, u.name, u.role, q.content, q.category
        ORDER BY a.answered_at DESC
        LIMIT $2 OFFSET $3
      `;

      const result = await this.query(sql, [pairId, limit, offset]);
      const answers = result.rows || result.rows;

      return {
        answers,
        pagination: this.buildPagination(page, limit, total)
      };
    } catch (error) {
      logger.error('Failed to find answers by pair:', error);
      throw error;
    }
  }

  /**
   * Get recent answers for a pair
   * @param {string} pairId - Pair ID
   * @param {number} days - Number of days to look back
   * @returns {Promise<array>} - Recent answers
   */
  async getRecentAnswers(pairId, days = 7) {
    try {
      const sql = `
        SELECT 
          a.*,
          u.name as user_name,
          u.role as user_role,
          q.content as question_content,
          q.category as question_category
        FROM ${this.tableName} a
        JOIN users u ON a.user_id = u.id
        JOIN questions q ON a.question_id = q.id
        WHERE a.pair_id = $1
          AND a.answered_at >= (CURRENT_TIMESTAMP - INTERVAL '${days} days')
        ORDER BY a.answered_at DESC
      `;

      const result = await this.query(sql, [pairId]);
      return result.rows || result.rows;
    } catch (error) {
      logger.error('Failed to get recent answers:', error);
      throw error;
    }
  }

  /**
   * Delete answer (only by owner)
   * @param {string} answerId - Answer ID
   * @param {string} userId - User ID (for ownership verification)
   * @returns {Promise<boolean>} - Success status
   */
  async deleteAnswer(answerId, userId) {
    try {
      // First verify ownership
      const answer = await this.findById(answerId);
      
      if (!answer) {
        throw new Error('Answer not found');
      }

      if (answer.user_id !== userId) {
        throw new Error('Not authorized to delete this answer');
      }

      // Delete reactions first (cascade)
      await this.query('DELETE FROM reactions WHERE answer_id = $1', [answerId]);

      // Delete the answer
      const deleted = await this.delete(answerId);

      if (deleted) {
        logger.info('Answer deleted', { answerId, userId });
      }

      return deleted;
    } catch (error) {
      logger.error('Failed to delete answer:', error);
      throw error;
    }
  }

  /**
   * Get answer reactions
   * @param {string} answerId - Answer ID
   * @returns {Promise<array>} - Answer reactions
   */
  async getAnswerReactions(answerId) {
    try {
      const sql = `
        SELECT 
          r.*,
          u.name as user_name,
          u.role as user_role
        FROM reactions r
        JOIN users u ON r.user_id = u.id
        WHERE r.answer_id = $1
        ORDER BY r.created_at ASC
      `;

      const result = await this.query(sql, [answerId]);
      return result.rows || result.rows;
    } catch (error) {
      logger.error('Failed to get answer reactions:', error);
      return [];
    }
  }

  /**
   * Add reaction to answer
   * @param {string} answerId - Answer ID
   * @param {string} userId - User ID
   * @param {string} emoji - Emoji reaction
   * @returns {Promise<object>} - Created reaction
   */
  async addReaction(answerId, userId, emoji) {
    try {
      // Check if answer exists
      const answer = await this.findById(answerId);
      if (!answer) {
        throw new Error('Answer not found');
      }

      // Check if user already reacted to this answer
      const existingReaction = await this.query(
        'SELECT id FROM reactions WHERE answer_id = $1 AND user_id = $2',
        [answerId, userId]
      );

      if (existingReaction.rows && existingReaction.rows.length > 0) {
        // Update existing reaction
        const updateSql = `
          UPDATE reactions 
          SET emoji = $1, created_at = CURRENT_TIMESTAMP 
          WHERE answer_id = $2 AND user_id = $3
          RETURNING *
        `;
        
        const result = await this.query(updateSql, [emoji, answerId, userId]);
        const reaction = result.rows ? result.rows[0] : result.rows[0];
        
        logger.info('Reaction updated', { answerId, userId, emoji });
        return reaction;
      } else {
        // Create new reaction
        const insertSql = `
          INSERT INTO reactions (answer_id, user_id, emoji, created_at)
          VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
          RETURNING *
        `;
        
        const result = await this.query(insertSql, [answerId, userId, emoji]);
        const reaction = result.rows ? result.rows[0] : result.rows[0];
        
        logger.info('Reaction added', { answerId, userId, emoji });
        return reaction;
      }
    } catch (error) {
      logger.error('Failed to add reaction:', error);
      throw error;
    }
  }

  /**
   * Remove reaction from answer
   * @param {string} answerId - Answer ID
   * @param {string} userId - User ID
   * @returns {Promise<boolean>} - Success status
   */
  async removeReaction(answerId, userId) {
    try {
      const sql = 'DELETE FROM reactions WHERE answer_id = $1 AND user_id = $2';
      const result = await this.query(sql, [answerId, userId]);
      
      const deleted = (result.rowCount || result.changes) > 0;
      
      if (deleted) {
        logger.info('Reaction removed', { answerId, userId });
      }

      return deleted;
    } catch (error) {
      logger.error('Failed to remove reaction:', error);
      throw error;
    }
  }

  /**
   * Get answer statistics for a pair
   * @param {string} pairId - Pair ID
   * @returns {Promise<object>} - Answer statistics
   */
  async getPairAnswerStats(pairId) {
    try {
      const sql = `
        SELECT 
          COUNT(DISTINCT a.id) as total_answers,
          COUNT(DISTINCT a.question_id) as questions_answered,
          COUNT(DISTINCT DATE(a.answered_at)) as active_days,
          AVG(LENGTH(a.content)) as avg_answer_length,
          COUNT(DISTINCT r.id) as total_reactions
        FROM ${this.tableName} a
        LEFT JOIN reactions r ON a.id = r.answer_id
        WHERE a.pair_id = $1
        GROUP BY a.pair_id
      `;

      const result = await this.query(sql, [pairId]);
      
      if (result.rows && result.rows.length > 0) {
        const stats = result.rows[0];
        return {
          totalAnswers: parseInt(stats.total_answers) || 0,
          questionsAnswered: parseInt(stats.questions_answered) || 0,
          activeDays: parseInt(stats.active_days) || 0,
          avgAnswerLength: parseFloat(stats.avg_answer_length) || 0,
          totalReactions: parseInt(stats.total_reactions) || 0,
        };
      }

      return {
        totalAnswers: 0,
        questionsAnswered: 0,
        activeDays: 0,
        avgAnswerLength: 0,
        totalReactions: 0,
      };
    } catch (error) {
      logger.error('Failed to get pair answer stats:', error);
      throw error;
    }
  }
}

module.exports = new Answer();