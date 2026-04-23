const express = require('express');
const { body, query } = require('express-validator');
const router = express.Router();

// Import controllers
const {
  getSwapRequests,
  getSwapRequestById,
  createSwapRequest,
  updateSwapRequest,
  acceptRequest,
  rejectRequest,
  cancelRequest,
  completeRequest,
  getPendingRequests,
  getActiveSwaps,
  getCompletedSwaps
} = require('../controllers/requestController');

// Import middleware
const { protect } = require('../middleware/auth');

// Validation middleware
const validateCreateRequest = [
  body('recipient')
    .notEmpty()
    .withMessage('Recipient is required')
    .isMongoId()
    .withMessage('Invalid recipient ID'),
  body('skillOffered.name')
    .trim()
    .notEmpty()
    .withMessage('Skill offered name is required')
    .isLength({ max: 50 })
    .withMessage('Skill offered name cannot exceed 50 characters'),
  body('skillOffered.category')
    .isIn(['programming', 'design', 'marketing', 'writing', 'music', 'language', 'business', 'fitness', 'cooking', 'other'])
    .withMessage('Invalid skill offered category'),
  body('skillWanted.name')
    .trim()
    .notEmpty()
    .withMessage('Skill wanted name is required')
    .isLength({ max: 50 })
    .withMessage('Skill wanted name cannot exceed 50 characters'),
  body('skillWanted.category')
    .isIn(['programming', 'design', 'marketing', 'writing', 'music', 'language', 'business', 'fitness', 'cooking', 'other'])
    .withMessage('Invalid skill wanted category'),
  body('message')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Message cannot exceed 500 characters'),
  body('scheduledDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format'),
  body('duration')
    .optional()
    .isInt({ min: 15, max: 480 })
    .withMessage('Duration must be between 15 and 480 minutes'),
  body('location')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Location cannot exceed 200 characters'),
  body('isOnline')
    .optional()
    .isBoolean()
    .withMessage('isOnline must be a boolean'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes cannot exceed 1000 characters')
];

const validateUpdateRequest = [
  body('skillOffered.name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Skill offered name cannot be empty')
    .isLength({ max: 50 })
    .withMessage('Skill offered name cannot exceed 50 characters'),
  body('skillOffered.category')
    .optional()
    .isIn(['programming', 'design', 'marketing', 'writing', 'music', 'language', 'business', 'fitness', 'cooking', 'other'])
    .withMessage('Invalid skill offered category'),
  body('skillWanted.name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Skill wanted name cannot be empty')
    .isLength({ max: 50 })
    .withMessage('Skill wanted name cannot exceed 50 characters'),
  body('skillWanted.category')
    .optional()
    .isIn(['programming', 'design', 'marketing', 'writing', 'music', 'language', 'business', 'fitness', 'cooking', 'other'])
    .withMessage('Invalid skill wanted category'),
  body('message')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Message cannot exceed 500 characters'),
  body('scheduledDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format'),
  body('duration')
    .optional()
    .isInt({ min: 15, max: 480 })
    .withMessage('Duration must be between 15 and 480 minutes'),
  body('location')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Location cannot exceed 200 characters'),
  body('isOnline')
    .optional()
    .isBoolean()
    .withMessage('isOnline must be a boolean'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes cannot exceed 1000 characters')
];

const validateRejectRequest = [
  body('reason')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Rejection reason cannot exceed 200 characters')
];

const validateGetRequests = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('status')
    .optional()
    .isIn(['pending', 'accepted', 'rejected', 'cancelled', 'completed'])
    .withMessage('Invalid status'),
  query('role')
    .optional()
    .isIn(['requester', 'recipient', 'all'])
    .withMessage('Invalid role')
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
 * @desc    Get all swap requests for a user
 * @route   GET /api/requests
 * @access  Private
 */
router.get('/', protect, validateGetRequests, handleValidationErrors, getSwapRequests);

/**
 * @desc    Get swap request by ID
 * @route   GET /api/requests/:id
 * @access  Private
 */
router.get('/:id', protect, getSwapRequestById);

/**
 * @desc    Create swap request
 * @route   POST /api/requests
 * @access  Private
 */
router.post('/', protect, validateCreateRequest, handleValidationErrors, createSwapRequest);

/**
 * @desc    Update swap request
 * @route   PUT /api/requests/:id
 * @access  Private
 */
router.put('/:id', protect, validateUpdateRequest, handleValidationErrors, updateSwapRequest);

/**
 * @desc    Accept swap request
 * @route   PUT /api/requests/:id/accept
 * @access  Private
 */
router.put('/:id/accept', protect, acceptRequest);

/**
 * @desc    Reject swap request
 * @route   PUT /api/requests/:id/reject
 * @access  Private
 */
router.put('/:id/reject', protect, validateRejectRequest, handleValidationErrors, rejectRequest);

/**
 * @desc    Cancel swap request
 * @route   PUT /api/requests/:id/cancel
 * @access  Private
 */
router.put('/:id/cancel', protect, cancelRequest);

/**
 * @desc    Complete swap request
 * @route   PUT /api/requests/:id/complete
 * @access  Private
 */
router.put('/:id/complete', protect, completeRequest);

/**
 * @desc    Get pending requests
 * @route   GET /api/requests/pending
 * @access  Private
 */
router.get('/pending', protect, getPendingRequests);

/**
 * @desc    Get active swaps
 * @route   GET /api/requests/active
 * @access  Private
 */
router.get('/active', protect, getActiveSwaps);

/**
 * @desc    Get completed swaps
 * @route   GET /api/requests/completed
 * @access  Private
 */
router.get('/completed', protect, getCompletedSwaps);

module.exports = router;
