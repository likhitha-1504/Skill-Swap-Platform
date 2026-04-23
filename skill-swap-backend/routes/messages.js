const express = require('express');
const { body, query } = require('express-validator');
const router = express.Router();

// Import controllers
const {
  getConversations,
  getMessages,
  sendMessage,
  markAsRead,
  getUnreadCount,
  deleteMessage
} = require('../controllers/messageController');

// Import middleware
const { protect } = require('../middleware/auth');

// Validation middleware
const validateSendMessage = [
  body('swapRequest')
    .notEmpty()
    .withMessage('Swap request ID is required')
    .isMongoId()
    .withMessage('Invalid swap request ID'),
  body('receiver')
    .notEmpty()
    .withMessage('Receiver ID is required')
    .isMongoId()
    .withMessage('Invalid receiver ID'),
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Message content is required')
    .isLength({ min: 1, max: 1000 })
    .withMessage('Message content must be between 1 and 1000 characters'),
  body('messageType')
    .optional()
    .isIn(['text', 'image', 'file', 'system'])
    .withMessage('Invalid message type')
];

const validateGetMessages = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('before')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format'),
  query('after')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format')
];

const validateGetConversations = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50')
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
 * @desc    Get conversations for a user
 * @route   GET /api/messages/conversations
 * @access  Private
 */
router.get('/conversations', protect, validateGetConversations, handleValidationErrors, getConversations);

/**
 * @desc    Get messages in a conversation
 * @route   GET /api/messages/conversation/:swapRequestId
 * @access  Private
 */
router.get('/conversation/:swapRequestId', protect, validateGetMessages, handleValidationErrors, getMessages);

/**
 * @desc    Send message
 * @route   POST /api/messages
 * @access  Private
 */
router.post('/', protect, validateSendMessage, handleValidationErrors, sendMessage);

/**
 * @desc    Mark messages as read
 * @route   PUT /api/messages/conversation/:swapRequestId/read
 * @access  Private
 */
router.put('/conversation/:swapRequestId/read', protect, markAsRead);

/**
 * @desc    Get unread message count
 * @route   GET /api/messages/unread-count
 * @access  Private
 */
router.get('/unread-count', protect, getUnreadCount);

/**
 * @desc    Delete message
 * @route   DELETE /api/messages/:id
 * @access  Private
 */
router.delete('/:id', protect, deleteMessage);

module.exports = router;
