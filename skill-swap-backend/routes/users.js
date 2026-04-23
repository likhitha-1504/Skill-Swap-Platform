const express = require('express');
const { body, query } = require('express-validator');
const router = express.Router();
const multer = require('multer');

// Import controllers
const {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  searchUsers,
  getUserStats,
  getSkillMatches,
  uploadAvatar
} = require('../controllers/userController');

// Import middleware
const { protect, authorize } = require('../middleware/auth');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'avatar-' + uniqueSuffix + '.' + file.originalname.split('.').pop());
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    // Allow only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Validation middleware
const validateUpdateUser = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('location')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Location cannot exceed 100 characters'),
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio cannot exceed 500 characters'),
  body('experienceLevel')
    .optional()
    .isIn(['beginner', 'intermediate', 'advanced', 'expert'])
    .withMessage('Invalid experience level'),
  body('availability')
    .optional()
    .isIn(['available', 'busy', 'unavailable'])
    .withMessage('Invalid availability status'),
  body('skillsOffered')
    .optional()
    .isArray()
    .withMessage('Skills offered must be an array'),
  body('skillsWanted')
    .optional()
    .isArray()
    .withMessage('Skills wanted must be an array'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean')
];

const validateSearch = [
  query('q')
    .notEmpty()
    .withMessage('Search query is required')
    .isLength({ min: 2 })
    .withMessage('Search query must be at least 2 characters long')
];

const validateGetUsers = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('sortBy')
    .optional()
    .isIn(['name', 'createdAt', 'rating.average', 'totalSwaps', 'completedSwaps'])
    .withMessage('Invalid sort field'),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc'),
  query('skillCategory')
    .optional()
    .isIn(['programming', 'design', 'marketing', 'writing', 'music', 'language', 'business', 'fitness', 'cooking', 'other'])
    .withMessage('Invalid skill category'),
  query('experienceLevel')
    .optional()
    .isIn(['beginner', 'intermediate', 'advanced', 'expert'])
    .withMessage('Invalid experience level'),
  query('availability')
    .optional()
    .isIn(['available', 'busy', 'unavailable'])
    .withMessage('Invalid availability status')
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
 * @desc    Get all users with pagination and filters
 * @route   GET /api/users
 * @access  Private
 */
router.get('/', protect, validateGetUsers, handleValidationErrors, getUsers);

/**
 * @desc    Search users
 * @route   GET /api/users/search
 * @access  Private
 */
router.get('/search', protect, validateSearch, handleValidationErrors, searchUsers);

/**
 * @desc    Get user by ID
 * @route   GET /api/users/:id
 * @access  Private
 */
router.get('/:id', protect, getUserById);

/**
 * @desc    Get user statistics
 * @route   GET /api/users/:id/stats
 * @access  Private
 */
router.get('/:id/stats', protect, getUserStats);

/**
 * @desc    Find skill matches for user
 * @route   GET /api/users/:id/matches
 * @access  Private
 */
router.get('/:id/matches', protect, getSkillMatches);

/**
 * @desc    Update user
 * @route   PUT /api/users/:id
 * @access  Private
 */
router.put('/:id', protect, authorize('admin'), validateUpdateUser, handleValidationErrors, updateUser);

/**
 * @desc    Upload avatar
 * @route   POST /api/users/:id/avatar
 * @access  Private
 */
router.post('/:id/avatar', protect, upload.single('avatar'), uploadAvatar);

/**
 * @desc    Delete user
 * @route   DELETE /api/users/:id
 * @access  Private
 */
router.delete('/:id', protect, authorize('admin'), deleteUser);

module.exports = router;
