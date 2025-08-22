const Answer = require('../models/Answer');
const Question = require('../models/Question');
const Pair = require('../models/Pair');
const ApiResponse = require('../utils/response');
const logger = require('../utils/logger');
const {
  NotFoundError,
  ConflictError,
  ForbiddenError,
} = require('../middleware/errorHandler');

class AnswerController {
  /**
   * Submit answer to a question
   * POST /api/answers
   */
  static async submitAnswer(req, res) {
    const { question_id, content } = req.body;
    const userId = req.user.id;

    try {
      // Get user's active pairs
      const pairs = await Pair.findActivePairsForUser(userId);

      if (pairs.length === 0) {
        throw new ForbiddenError('No active pairs found');
      }

      const primaryPair = pairs[0];

      // Verify question exists and is active
      const question = await Question.findById(question_id);
      if (!question || !question.active) {
        throw new NotFoundError('Question not found or inactive');
      }

      // Check if user has already answered this question
      const existingAnswer = await Answer.findUserAnswer(
        question_id,
        userId,
        primaryPair.id
      );
      if (existingAnswer) {
        throw new ConflictError('You have already answered this question');
      }

      // Create answer
      const answer = await Answer.create({
        question_id,
        user_id: userId,
        pair_id: primaryPair.id,
        content,
      });

      // Get created answer with user info
      const answerWithInfo = await Answer.findById(answer.id);
      const user = req.user;

      const response = {
        id: answerWithInfo.id,
        content: answerWithInfo.content,
        answered_at: answerWithInfo.answered_at,
        question: {
          id: question.id,
          content: question.content,
          category: question.category,
        },
        user: {
          id: user.id,
          name: user.name,
          role: user.role,
        },
        reactions: [],
      };

      logger.info('Answer submitted', {
        answerId: answer.id,
        questionId: question_id,
        userId,
        pairId: primaryPair.id,
      });

      return ApiResponse.created(
        res,
        response,
        'Answer submitted successfully'
      );
    } catch (error) {
      logger.error('Failed to submit answer:', error);
      throw error;
    }
  }

  /**
   * Get answers for a specific question
   * GET /api/answers/question/:questionId
   */
  static async getAnswersForQuestion(req, res) {
    const { questionId } = req.params;
    const userId = req.user.id;

    try {
      // Get user's active pairs
      const pairs = await Pair.findActivePairsForUser(userId);

      if (pairs.length === 0) {
        return ApiResponse.success(
          res,
          { answers: [] },
          'No active pairs found'
        );
      }

      const primaryPair = pairs[0];

      // Verify question exists
      const question = await Question.findById(questionId);
      if (!question) {
        throw new NotFoundError('Question not found');
      }

      // Get answers for this question and pair
      const answers = await Answer.findByQuestionAndPair(
        questionId,
        primaryPair.id
      );

      return ApiResponse.success(
        res,
        {
          question: {
            id: question.id,
            content: question.content,
            category: question.category,
          },
          answers,
        },
        'Answers retrieved successfully'
      );
    } catch (error) {
      logger.error('Failed to get answers for question:', error);
      throw error;
    }
  }

  /**
   * Get user's own answer for a specific question
   * GET /api/answers/question/:questionId/mine
   */
  static async getMyAnswer(req, res) {
    const { questionId } = req.params;
    const userId = req.user.id;

    try {
      // Get user's active pairs
      const pairs = await Pair.findActivePairsForUser(userId);

      if (pairs.length === 0) {
        return ApiResponse.success(
          res,
          { answer: null },
          'No active pairs found'
        );
      }

      const primaryPair = pairs[0];
      const answer = await Answer.findUserAnswer(
        questionId,
        userId,
        primaryPair.id
      );

      return ApiResponse.success(
        res,
        {
          answer: answer || null,
        },
        answer ? 'Answer retrieved successfully' : 'No answer found'
      );
    } catch (error) {
      logger.error('Failed to get user answer:', error);
      throw error;
    }
  }

  /**
   * Get answers for a pair (paginated)
   * GET /api/answers/pair/:pairId
   */
  static async getAnswersForPair(req, res) {
    const { pairId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    try {
      // Pair membership is already verified by middleware
      const result = await Answer.findByPairPaginated(
        pairId,
        parseInt(page),
        parseInt(limit)
      );

      return ApiResponse.paginated(
        res,
        result.answers,
        result.pagination,
        'Pair answers retrieved successfully'
      );
    } catch (error) {
      logger.error('Failed to get answers for pair:', error);
      throw error;
    }
  }

  /**
   * Get recent answers for a pair
   * GET /api/answers/pair/:pairId/recent
   */
  static async getRecentAnswers(req, res) {
    const { pairId } = req.params;
    const { days = 7 } = req.query;

    try {
      // Pair membership is already verified by middleware
      const answers = await Answer.getRecentAnswers(pairId, parseInt(days));

      return ApiResponse.success(
        res,
        {
          answers,
          days: parseInt(days),
        },
        'Recent answers retrieved successfully'
      );
    } catch (error) {
      logger.error('Failed to get recent answers:', error);
      throw error;
    }
  }

  /**
   * Get specific answer by ID
   * GET /api/answers/:id
   */
  static async getAnswerById(req, res) {
    const { id } = req.params;
    const userId = req.user.id;

    try {
      const answer = await Answer.findById(id);

      if (!answer) {
        throw new NotFoundError('Answer not found');
      }

      // Verify user has access to this answer (same pair)
      const pairs = await Pair.findActivePairsForUser(userId);
      const hasAccess = pairs.some((pair) => pair.id === answer.pair_id);

      if (!hasAccess) {
        throw new ForbiddenError('Access denied');
      }

      // Get answer with reactions
      const reactions = await Answer.getAnswerReactions(id);

      return ApiResponse.success(
        res,
        {
          ...answer,
          reactions,
        },
        'Answer retrieved successfully'
      );
    } catch (error) {
      logger.error('Failed to get answer by ID:', error);
      throw error;
    }
  }

  /**
   * Update answer content (owner only)
   * PUT /api/answers/:id
   */
  static async updateAnswer(req, res) {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    try {
      const updatedAnswer = await Answer.updateContent(id, content, userId);

      if (!updatedAnswer) {
        throw new NotFoundError('Answer not found or access denied');
      }

      logger.info('Answer updated', { answerId: id, userId });

      return ApiResponse.success(
        res,
        updatedAnswer,
        'Answer updated successfully'
      );
    } catch (error) {
      logger.error('Failed to update answer:', error);
      throw error;
    }
  }

  /**
   * Delete answer (owner only)
   * DELETE /api/answers/:id
   */
  static async deleteAnswer(req, res) {
    const { id } = req.params;
    const userId = req.user.id;

    try {
      const deleted = await Answer.deleteAnswer(id, userId);

      if (!deleted) {
        throw new NotFoundError('Answer not found or access denied');
      }

      logger.info('Answer deleted', { answerId: id, userId });

      return ApiResponse.success(res, null, 'Answer deleted successfully');
    } catch (error) {
      logger.error('Failed to delete answer:', error);
      throw error;
    }
  }

  /**
   * Add reaction to an answer
   * POST /api/answers/:id/reaction
   */
  static async addReaction(req, res) {
    const { id } = req.params;
    const { emoji } = req.body;
    const userId = req.user.id;

    try {
      // Verify user has access to this answer
      const answer = await Answer.findById(id);
      if (!answer) {
        throw new NotFoundError('Answer not found');
      }

      const pairs = await Pair.findActivePairsForUser(userId);
      const hasAccess = pairs.some((pair) => pair.id === answer.pair_id);

      if (!hasAccess) {
        throw new ForbiddenError('Access denied');
      }

      const reaction = await Answer.addReaction(id, userId, emoji);

      logger.info('Reaction added', { answerId: id, userId, emoji });

      return ApiResponse.created(res, reaction, 'Reaction added successfully');
    } catch (error) {
      logger.error('Failed to add reaction:', error);
      throw error;
    }
  }

  /**
   * Remove reaction from an answer
   * DELETE /api/answers/:id/reaction
   */
  static async removeReaction(req, res) {
    const { id } = req.params;
    const userId = req.user.id;

    try {
      // Verify user has access to this answer
      const answer = await Answer.findById(id);
      if (!answer) {
        throw new NotFoundError('Answer not found');
      }

      const pairs = await Pair.findActivePairsForUser(userId);
      const hasAccess = pairs.some((pair) => pair.id === answer.pair_id);

      if (!hasAccess) {
        throw new ForbiddenError('Access denied');
      }

      const removed = await Answer.removeReaction(id, userId);

      if (!removed) {
        throw new NotFoundError('Reaction not found');
      }

      logger.info('Reaction removed', { answerId: id, userId });

      return ApiResponse.success(res, null, 'Reaction removed successfully');
    } catch (error) {
      logger.error('Failed to remove reaction:', error);
      throw error;
    }
  }

  /**
   * Get reactions for an answer
   * GET /api/answers/:id/reactions
   */
  static async getAnswerReactions(req, res) {
    const { id } = req.params;
    const userId = req.user.id;

    try {
      // Verify user has access to this answer
      const answer = await Answer.findById(id);
      if (!answer) {
        throw new NotFoundError('Answer not found');
      }

      const pairs = await Pair.findActivePairsForUser(userId);
      const hasAccess = pairs.some((pair) => pair.id === answer.pair_id);

      if (!hasAccess) {
        throw new ForbiddenError('Access denied');
      }

      const reactions = await Answer.getAnswerReactions(id);

      return ApiResponse.success(
        res,
        {
          reactions,
        },
        'Reactions retrieved successfully'
      );
    } catch (error) {
      logger.error('Failed to get answer reactions:', error);
      throw error;
    }
  }

  /**
   * Get answer statistics for a pair
   * GET /api/answers/pair/:pairId/stats
   */
  static async getPairAnswerStats(req, res) {
    const { pairId } = req.params;

    try {
      // Pair membership is already verified by middleware
      const stats = await Answer.getPairAnswerStats(pairId);

      return ApiResponse.success(
        res,
        {
          stats,
        },
        'Pair answer statistics retrieved successfully'
      );
    } catch (error) {
      logger.error('Failed to get pair answer stats:', error);
      throw error;
    }
  }

  /**
   * Get user's answer history
   * GET /api/answers/user/history
   */
  static async getUserAnswerHistory(req, res) {
    const { page = 1, limit = 10, pair_id, date_from, date_to } = req.query;
    const userId = req.user.id;

    try {
      // Build conditions
      let conditions = { user_id: userId };

      if (pair_id) {
        // Verify user is member of the pair
        const pairs = await Pair.findActivePairsForUser(userId);
        const hasAccess = pairs.some((pair) => pair.id === pair_id);

        if (!hasAccess) {
          throw new ForbiddenError('Access denied to this pair');
        }

        conditions.pair_id = pair_id;
      }

      // Date filtering would need custom SQL in production
      const offset = (parseInt(page) - 1) * parseInt(limit);
      const answers = await Answer.find(conditions, {
        limit: parseInt(limit),
        offset,
        orderBy: 'answered_at DESC',
      });

      const total = await Answer.count(conditions);
      const pagination = Answer.buildPagination(
        parseInt(page),
        parseInt(limit),
        total
      );

      return ApiResponse.paginated(
        res,
        answers,
        pagination,
        'Answer history retrieved successfully'
      );
    } catch (error) {
      logger.error('Failed to get user answer history:', error);
      throw error;
    }
  }

  /**
   * Export answers for a pair (CSV format)
   * GET /api/answers/pair/:pairId/export
   */
  static async exportAnswers(req, res) {
    const { pairId } = req.params;
    const { format = 'csv', date_from, date_to } = req.query;

    try {
      // Pair membership is already verified by middleware

      // Get all answers for the pair
      const answers = await Answer.find(
        { pair_id: pairId },
        {
          orderBy: 'answered_at ASC',
        }
      );

      if (format === 'csv') {
        // Generate CSV
        const csvHeader = 'Date,Question,Answer,User,Role\n';
        const csvData = answers
          .map((answer) => {
            const date = new Date(answer.answered_at)
              .toISOString()
              .split('T')[0];
            const question = answer.question_content || 'Question not found';
            const content = `"${answer.content.replace(/"/g, '""')}"`;
            const user = answer.user_name || 'Unknown';
            const role = answer.user_role || 'Unknown';

            return `${date},${question},${content},${user},${role}`;
          })
          .join('\n');

        const csv = csvHeader + csvData;

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader(
          'Content-Disposition',
          `attachment; filename="answers-${pairId}.csv"`
        );

        return res.send(csv);
      } else {
        // Return JSON format
        return ApiResponse.success(
          res,
          {
            answers,
            exported_at: new Date().toISOString(),
            format,
          },
          'Answers exported successfully'
        );
      }
    } catch (error) {
      logger.error('Failed to export answers:', error);
      throw error;
    }
  }
}

module.exports = AnswerController;
