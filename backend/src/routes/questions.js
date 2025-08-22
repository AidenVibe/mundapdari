const express = require('express');
const router = express.Router();
const { validate, validationSchemas } = require('../utils/validation');
const { validateJWT, requireRole } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const QuestionController = require('../controllers/QuestionController');

/**
 * Get today's question for authenticated user
 * GET /api/questions/today
 */
router.get('/today', asyncHandler(QuestionController.getTodaysQuestion));

/**
 * Get specific question by ID
 * GET /api/questions/:id
 */
router.get('/:id', asyncHandler(QuestionController.getQuestionById));

/**
 * Get questions by category
 * GET /api/questions/category/:category
 */
router.get(
  '/category/:category',
  validate(validationSchemas.pagination, 'query'),
  asyncHandler(QuestionController.getQuestionsByCategory)
);

/**
 * Get all active questions (paginated)
 * GET /api/questions
 */
router.get(
  '/',
  validate(validationSchemas.pagination, 'query'),
  asyncHandler(QuestionController.getAllQuestions)
);

/**
 * Search questions
 * GET /api/questions/search?q=searchTerm
 */
router.get(
  '/search',
  validate(
    {
      q: require('joi').string().min(2).max(100).required(),
      limit: require('joi').number().integer().min(1).max(50).default(10),
    },
    'query'
  ),
  asyncHandler(QuestionController.searchQuestions)
);

/**
 * Get question categories
 * GET /api/questions/meta/categories
 */
router.get('/meta/categories', asyncHandler(QuestionController.getCategories));

/**
 * Get question statistics
 * GET /api/questions/:id/stats
 */
router.get('/:id/stats', asyncHandler(QuestionController.getQuestionStats));

// Admin routes (require admin role - for future implementation)
/**
 * Create new question (Admin only)
 * POST /api/questions
 */
router.post(
  '/',
  requireRole('admin'), // This role doesn't exist yet but prepared for future
  validate(
    {
      content: require('joi').string().min(10).max(500).required(),
      category: require('joi').string().max(50).optional(),
      order_num: require('joi').number().integer().min(0).optional(),
      active: require('joi').boolean().default(true),
    },
    'body'
  ),
  asyncHandler(QuestionController.createQuestion)
);

/**
 * Update question (Admin only)
 * PUT /api/questions/:id
 */
router.put(
  '/:id',
  requireRole('admin'),
  validate(
    {
      content: require('joi').string().min(10).max(500).optional(),
      category: require('joi').string().max(50).optional(),
      order_num: require('joi').number().integer().min(0).optional(),
      active: require('joi').boolean().optional(),
    },
    'body'
  ),
  asyncHandler(QuestionController.updateQuestion)
);

/**
 * Update question order (Admin only)
 * PATCH /api/questions/:id/order
 */
router.patch(
  '/:id/order',
  requireRole('admin'),
  validate(
    {
      order_num: require('joi').number().integer().min(0).required(),
    },
    'body'
  ),
  asyncHandler(QuestionController.updateQuestionOrder)
);

/**
 * Activate/Deactivate question (Admin only)
 * PATCH /api/questions/:id/status
 */
router.patch(
  '/:id/status',
  requireRole('admin'),
  validate(
    {
      active: require('joi').boolean().required(),
    },
    'body'
  ),
  asyncHandler(QuestionController.setQuestionStatus)
);

/**
 * Delete question (Admin only)
 * DELETE /api/questions/:id
 */
router.delete(
  '/:id',
  requireRole('admin'),
  asyncHandler(QuestionController.deleteQuestion)
);

module.exports = router;
