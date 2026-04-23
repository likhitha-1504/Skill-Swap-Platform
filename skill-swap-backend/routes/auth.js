const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

// Import controllers
const {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  deleteAccount
} = require('../controllers/authController');

// Import middleware
const { protect } = require('../middleware/auth');

// Validation middleware
const validateRegister = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
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
  body('skillsOffered')
    .optional()
    .isArray()
    .withMessage('Skills offered must be an array'),
  body('skillsWanted')
    .optional()
    .isArray()
    .withMessage('Skills wanted must be an array')
];

const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

const validateUpdateProfile = [
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
    .withMessage('Skills wanted must be an array')
];

const validateChangePassword = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number')
];

const validateDeleteAccount = [
  body('password')
    .notEmpty()
    .withMessage('Password is required to delete account')
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
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
router.post('/register', validateRegister, handleValidationErrors, register);

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
router.post('/login', validateLogin, handleValidationErrors, login);

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/profile
 * @access  Private
 */
router.get('/profile', protect, getProfile);

/**
 * @desc    Update user profile
 * @route   PUT /api/auth/profile
 * @access  Private
 */
router.put('/profile', protect, validateUpdateProfile, handleValidationErrors, updateProfile);

/**
 * @desc    Change user password
 * @route   PUT /api/auth/change-password
 * @access  Private
 */
router.put('/change-password', protect, validateChangePassword, handleValidationErrors, changePassword);

/**
 * @desc    Delete user account
 * @route   DELETE /api/auth/delete-account
 * @access  Private
 */
router.delete('/delete-account', protect, validateDeleteAccount, handleValidationErrors, deleteAccount);

module.exports = router;
