const Question = require('../models/Question');
const Answer = require('../models/Answer');
const Pair = require('../models/Pair');
const ApiResponse = require('../utils/response');
const logger = require('../utils/logger');
const { NotFoundError, ConflictError } = require('../middleware/errorHandler');

class QuestionController {
  /**
   * Get today's question for authenticated user
   * GET /api/questions/today
   */
  static async getTodaysQuestion(req, res) {
    try {
      const userId = req.user.id;
      
      // Get user's active pairs
      const pairs = await Pair.findActivePairsForUser(userId);
      
      if (pairs.length === 0) {
        return ApiResponse.success(res, {
          question: null,
          message: 'No active pairs found. Create or accept an invitation to see questions.',
        }, 'No active pairs');
      }

      // Get today's question for the first active pair
      const primaryPair = pairs[0];
      const question = await Question.getTodaysQuestion(primaryPair.id);
      
      if (!question) {
        return ApiResponse.success(res, {
          question: null,
          message: 'No questions available at the moment.',
        }, 'No questions available');
      }

      // Get user's answer for this question
      const userAnswer = await Answer.findUserAnswer(question.id, userId, primaryPair.id);
      
      // Get partner's answer for this question
      const partner = await Pair.getPairPartner(userId, primaryPair.id);
      const partnerAnswer = partner ? 
        await Answer.findUserAnswer(question.id, partner.partner_id, primaryPair.id) : null;

      const response = {
        question: {
          id: question.id,
          content: question.content,
          category: question.category,
        },
        pair: {
          id: primaryPair.id,
          partner_name: partner?.partner_name,
        },
        my_answer: userAnswer ? {
          id: userAnswer.id,
          content: userAnswer.content,
          answered_at: userAnswer.answered_at,
          reactions: userAnswer.reactions || [],
        } : null,
        partner_answer: partnerAnswer ? {
          id: partnerAnswer.id,
          content: partnerAnswer.content,
          answered_at: partnerAnswer.answered_at,
          reactions: partnerAnswer.reactions || [],
        } : null,
        both_answered: userAnswer && partnerAnswer,
      };

      return ApiResponse.success(res, response, 'Today\'s question retrieved successfully');

    } catch (error) {
      logger.error('Failed to get today\'s question:', error);
      throw error;
    }
  }

  /**
   * Get specific question by ID
   * GET /api/questions/:id
   */
  static async getQuestionById(req, res) {
    const { id } = req.params;
    const userId = req.user.id;

    try {
      // Get user's active pairs
      const pairs = await Pair.findActivePairsForUser(userId);
      const primaryPair = pairs[0];

      const question = await Question.findByIdWithAnswers(id, primaryPair?.id);
      
      if (!question) {
        throw new NotFoundError('Question not found');
      }

      // Filter answers to only show from the user's pair
      if (primaryPair) {
        question.answers = question.answers.filter(answer => 
          answer.pair_id === primaryPair.id
        );
      } else {
        question.answers = [];
      }

      return ApiResponse.success(res, {
        question,
        pair_id: primaryPair?.id,
      }, 'Question retrieved successfully');

    } catch (error) {
      logger.error('Failed to get question by ID:', error);
      throw error;
    }
  }

  /**
   * Get questions by category
   * GET /api/questions/category/:category
   */
  static async getQuestionsByCategory(req, res) {
    const { category } = req.params;
    const { page = 1, limit = 10 } = req.query;

    try {
      const questions = await Question.findByCategory(category, {
        limit: parseInt(limit),
        offset: (parseInt(page) - 1) * parseInt(limit),
      });

      const total = await Question.count({ category, active: true });
      const pagination = Question.buildPagination(parseInt(page), parseInt(limit), total);

      return ApiResponse.paginated(res, questions, pagination, 
        `Questions in category '${category}' retrieved successfully`);

    } catch (error) {
      logger.error('Failed to get questions by category:', error);
      throw error;
    }
  }

  /**
   * Get all active questions (paginated)
   * GET /api/questions
   */
  static async getAllQuestions(req, res) {
    const { page = 1, limit = 10 } = req.query;

    try {
      const result = await Question.findActivePaginated(parseInt(page), parseInt(limit));

      return ApiResponse.paginated(res, result.questions, result.pagination,
        'Questions retrieved successfully');

    } catch (error) {
      logger.error('Failed to get all questions:', error);
      throw error;
    }
  }

  /**
   * Search questions
   * GET /api/questions/search?q=searchTerm
   */
  static async searchQuestions(req, res) {
    const { q: searchTerm, limit = 10 } = req.query;

    try {
      const questions = await Question.search(searchTerm, { limit: parseInt(limit) });

      return ApiResponse.success(res, {
        questions,
        search_term: searchTerm,
        count: questions.length,
      }, 'Search completed successfully');

    } catch (error) {
      logger.error('Failed to search questions:', error);
      throw error;
    }
  }

  /**
   * Get question categories
   * GET /api/questions/meta/categories
   */
  static async getCategories(req, res) {
    try {
      const categories = await Question.getCategories();

      return ApiResponse.success(res, {
        categories,
      }, 'Categories retrieved successfully');

    } catch (error) {
      logger.error('Failed to get categories:', error);
      throw error;
    }
  }

  /**
   * Get question statistics
   * GET /api/questions/:id/stats
   */
  static async getQuestionStats(req, res) {
    const { id } = req.params;

    try {
      const question = await Question.findById(id);
      if (!question) {
        throw new NotFoundError('Question not found');
      }

      const stats = await Question.getQuestionStats(id);

      return ApiResponse.success(res, {
        question: {
          id: question.id,
          content: question.content,
          category: question.category,
        },
        stats,
      }, 'Question statistics retrieved successfully');

    } catch (error) {
      logger.error('Failed to get question stats:', error);
      throw error;
    }
  }

  // Admin-only methods (for future implementation)
  
  /**
   * Create new question (Admin only)
   * POST /api/questions
   */
  static async createQuestion(req, res) {
    const { content, category, order_num, active } = req.body;

    try {
      const question = await Question.create({
        content,
        category,
        order_num,
        active,
      });

      logger.info('Question created', { 
        questionId: question.id, 
        adminId: req.user.id 
      });

      return ApiResponse.created(res, question, 'Question created successfully');

    } catch (error) {
      logger.error('Failed to create question:', error);
      throw error;
    }
  }

  /**
   * Update question (Admin only)
   * PUT /api/questions/:id
   */
  static async updateQuestion(req, res) {
    const { id } = req.params;
    const updateData = req.body;

    try {
      const updatedQuestion = await Question.update(id, updateData);
      
      if (!updatedQuestion) {
        throw new NotFoundError('Question not found');
      }

      logger.info('Question updated', { 
        questionId: id, 
        adminId: req.user.id 
      });

      return ApiResponse.success(res, updatedQuestion, 'Question updated successfully');

    } catch (error) {
      logger.error('Failed to update question:', error);
      throw error;
    }
  }

  /**
   * Update question order (Admin only)
   * PATCH /api/questions/:id/order
   */
  static async updateQuestionOrder(req, res) {
    const { id } = req.params;
    const { order_num } = req.body;

    try {
      const updatedQuestion = await Question.updateOrder(id, order_num);
      
      if (!updatedQuestion) {
        throw new NotFoundError('Question not found');
      }

      logger.info('Question order updated', { 
        questionId: id, 
        newOrder: order_num,
        adminId: req.user.id 
      });

      return ApiResponse.success(res, updatedQuestion, 'Question order updated successfully');

    } catch (error) {
      logger.error('Failed to update question order:', error);
      throw error;
    }
  }

  /**
   * Activate/Deactivate question (Admin only)
   * PATCH /api/questions/:id/status
   */
  static async setQuestionStatus(req, res) {
    const { id } = req.params;
    const { active } = req.body;

    try {
      const updatedQuestion = await Question.setActive(id, active);
      
      if (!updatedQuestion) {
        throw new NotFoundError('Question not found');
      }

      logger.info(`Question ${active ? 'activated' : 'deactivated'}`, { 
        questionId: id, 
        adminId: req.user.id 
      });

      return ApiResponse.success(res, updatedQuestion, 
        `Question ${active ? 'activated' : 'deactivated'} successfully`);

    } catch (error) {
      logger.error('Failed to set question status:', error);
      throw error;
    }
  }

  /**
   * Delete question (Admin only)
   * DELETE /api/questions/:id
   */
  static async deleteQuestion(req, res) {
    const { id } = req.params;

    try {
      // Check if question has answers
      const stats = await Question.getQuestionStats(id);
      if (stats.totalAnswers > 0) {
        throw new ConflictError('Cannot delete question that has answers');
      }

      const deleted = await Question.delete(id);
      
      if (!deleted) {
        throw new NotFoundError('Question not found');
      }

      logger.info('Question deleted', { 
        questionId: id, 
        adminId: req.user.id 
      });

      return ApiResponse.success(res, null, 'Question deleted successfully');

    } catch (error) {
      logger.error('Failed to delete question:', error);
      throw error;
    }
  }
}

module.exports = QuestionController;