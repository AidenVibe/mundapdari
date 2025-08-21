const express = require('express');
const router = express.Router();
const { validate, validationSchemas } = require('../utils/validation');
const { validateJWT, requirePairMembership, requireOwnership } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const AnswerController = require('../controllers/AnswerController');

/**
 * Submit answer to a question
 * POST /api/answers
 */
router.post('/',
  validate(validationSchemas.submitAnswer, 'body'),
  asyncHandler(AnswerController.submitAnswer)
);

/**
 * Get answers for a specific question
 * GET /api/answers/question/:questionId
 */
router.get('/question/:questionId',
  asyncHandler(AnswerController.getAnswersForQuestion)
);

/**
 * Get user's own answer for a specific question
 * GET /api/answers/question/:questionId/mine
 */
router.get('/question/:questionId/mine',
  asyncHandler(AnswerController.getMyAnswer)
);

/**
 * Get answers for a pair (paginated)
 * GET /api/answers/pair/:pairId
 */
router.get('/pair/:pairId',
  requirePairMembership,
  validate(validationSchemas.pagination, 'query'),
  asyncHandler(AnswerController.getAnswersForPair)
);

/**
 * Get recent answers for a pair
 * GET /api/answers/pair/:pairId/recent
 */
router.get('/pair/:pairId/recent',
  requirePairMembership,
  validate({
    days: require('joi').number().integer().min(1).max(30).default(7),
  }, 'query'),
  asyncHandler(AnswerController.getRecentAnswers)
);

/**
 * Get specific answer by ID
 * GET /api/answers/:id
 */
router.get('/:id',
  asyncHandler(AnswerController.getAnswerById)
);

/**
 * Update answer content (owner only)
 * PUT /api/answers/:id
 */
router.put('/:id',
  requireOwnership('id', 'user_id'),
  validate(validationSchemas.updateAnswer, 'body'),
  asyncHandler(AnswerController.updateAnswer)
);

/**
 * Delete answer (owner only)
 * DELETE /api/answers/:id
 */
router.delete('/:id',
  requireOwnership('id', 'user_id'),
  asyncHandler(AnswerController.deleteAnswer)
);

/**
 * Add reaction to an answer
 * POST /api/answers/:id/reaction
 */
router.post('/:id/reaction',
  validate(validationSchemas.addReaction, 'body'),
  asyncHandler(AnswerController.addReaction)
);

/**
 * Remove reaction from an answer
 * DELETE /api/answers/:id/reaction
 */
router.delete('/:id/reaction',
  asyncHandler(AnswerController.removeReaction)
);

/**
 * Get reactions for an answer
 * GET /api/answers/:id/reactions
 */
router.get('/:id/reactions',
  asyncHandler(AnswerController.getAnswerReactions)
);

/**
 * Get answer statistics for a pair
 * GET /api/answers/pair/:pairId/stats
 */
router.get('/pair/:pairId/stats',
  requirePairMembership,
  asyncHandler(AnswerController.getPairAnswerStats)
);

/**
 * Get user's answer history
 * GET /api/answers/user/history
 */
router.get('/user/history',
  validate({
    ...validationSchemas.pagination,
    pair_id: require('joi').string().uuid().optional(),
    date_from: require('joi').date().iso().optional(),
    date_to: require('joi').date().iso().min(require('joi').ref('date_from')).optional(),
  }, 'query'),
  asyncHandler(AnswerController.getUserAnswerHistory)
);

/**
 * Export answers for a pair (CSV format)
 * GET /api/answers/pair/:pairId/export
 */
router.get('/pair/:pairId/export',
  requirePairMembership,
  validate({
    format: require('joi').string().valid('csv', 'json').default('csv'),
    date_from: require('joi').date().iso().optional(),
    date_to: require('joi').date().iso().min(require('joi').ref('date_from')).optional(),
  }, 'query'),
  asyncHandler(AnswerController.exportAnswers)
);

module.exports = router;