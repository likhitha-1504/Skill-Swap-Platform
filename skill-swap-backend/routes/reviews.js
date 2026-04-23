const express = require('express');
const { body, query } = require('express-validator');
const router = express.Router();

// Import controllers
const {
  getReviews,
  createReview,
  updateReview,
  deleteReview,
  getUserRating,
  getGivenReviews,
  getReceivedReviews
} = require('../controllers/reviewController');

// Import middleware
const { protect } = require('../middleware/auth');

// Validation middleware
const validateCreateReview = [
  body('reviewee')
    .notEmpty()
    .withMessage('Reviewee ID is required')
    .isMongoId()
    .withMessage('Invalid reviewee ID'),
  body('swapRequest')
    .notEmpty()
    .withMessage('Swap request ID is required')
    .isMongoId()
    .withMessage('Invalid swap request ID'),
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Review title is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('Title must be between 1 and 100 characters'),
  body('comment')
    .trim()
    .notEmpty()
    .withMessage('Review comment is required')
    .isLength({ min: 1, max: 500 })
    .withMessage('Comment must be between 1 and 500 characters'),
  body('skillsExchanged')
    .optional()
    .isArray()
    .withMessage('Skills exchanged must be an array'),
  body('wouldSwapAgain')
    .isBoolean()
    .withMessage('Would swap again must be a boolean'),
  body('communicationRating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Communication rating must be between 1 and 5'),
  body('punctualityRating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Punctuality rating must be between 1 and 5'),
  body('skillQualityRating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Skill quality rating must be between 1 and 5'),
  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('Is public must be a boolean')
];

const validateUpdateReview = [
  body('rating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Title cannot be empty')
    .isLength({ min: 1, max: 100 })
    .withMessage('Title must be between 1 and 100 characters'),
  body('comment')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Comment cannot be empty')
    .isLength({ min: 1, max: 500 })
    .withMessage('Comment must be between 1 and 500 characters'),
  body('skillsExchanged')
    .optional()
    .isArray()
    .withMessage('Skills exchanged must be an array'),
  body('wouldSwapAgain')
    .optional()
    .isBoolean()
    .withMessage('Would swap again must be a boolean'),
  body('communicationRating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Communication rating must be between 1 and 5'),
  body('punctualityRating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Punctuality rating must be between 1 and 5'),
  body('skillQualityRating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Skill quality rating must be between 1 and 5'),
  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('Is public must be a boolean')
];

const validateGetReviews = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50'),
  query('sortBy')
    .optional()
    .isIn(['createdAt', 'rating', 'helpfulCount'])
    .withMessage('Invalid sort field'),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc'),
  query('rating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  query('isPublic')
    .optional()
    .isBoolean()
    .withMessage('Is public must be a boolean')
];

// Error handling middleware
const handleValidationErrors = (req, res, next) => {
  const errors = require('express-validator').validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg);
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      message: errorMessages.join(', ')
    });
  }
  
  next();
};

/**
 * @desc    Get reviews for a user
 * @route   GET /api/reviews/user/:userId
 * @access  Public
 */
router.get('/user/:userId', validateGetReviews, handleValidationErrors, getReviews);

/**
 * @desc    Get user's average rating
 * @route   GET /api/reviews/user/:userId/rating
 * @access  Public
 */
router.get('/user/:userId/rating', getUserRating);

/**
 * @desc    Get reviews given by user
 * @route   GET /api/reviews/given/:userId
 * @access  Private
 */
router.get('/given/:userId', protect, validateGetReviews, handleValidationErrors, getGivenReviews);

/**
 * @desc    Get reviews received by user
 * @route   GET /api/reviews/received/:userId
 * @access  Private
 */
router.get('/received/:userId', protect, validateGetReviews, handleValidationErrors, getReceivedReviews);

/**
 * @desc    Create review
 * @route   POST /api/reviews
 * @access  Private
 */
router.post('/', protect, validateCreateReview, handleValidationErrors, createReview);

/**
 * @desc    Update review
 * @route   PUT /api/reviews/:id
 * @access  Private
 */
router.put('/:id', protect, validateUpdateReview, handleValidationErrors, updateReview);

/**
 * @desc    Delete review
 * @route   DELETE /api/reviews/:id
 * @access  Private
 */
router.delete('/:id', protect, deleteReview);

module.exports = router;
