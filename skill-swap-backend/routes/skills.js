const express = require('express');
const { body, query } = require('express-validator');
const router = express.Router();

// Import controllers
const {
  getSkills,
  getCategories,
  getSkillsByCategory,
  searchSkills,
  getPopularSkills,
  addSkill,
  updateSkill,
  removeSkill
} = require('../controllers/skillsController');

// Import middleware
const { protect } = require('../middleware/auth');

// Validation middleware
const validateAddSkill = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Skill name is required')
    .isLength({ max: 50 })
    .withMessage('Skill name cannot exceed 50 characters'),
  body('category')
    .isIn(['programming', 'design', 'marketing', 'writing', 'music', 'language', 'business', 'fitness', 'cooking', 'other'])
    .withMessage('Invalid skill category'),
  body('experienceLevel')
    .optional()
    .isIn(['beginner', 'intermediate', 'advanced', 'expert'])
    .withMessage('Invalid experience level'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Description cannot exceed 200 characters')
];

const validateUpdateSkill = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Skill name cannot be empty')
    .isLength({ max: 50 })
    .withMessage('Skill name cannot exceed 50 characters'),
  body('category')
    .optional()
    .isIn(['programming', 'design', 'marketing', 'writing', 'music', 'language', 'business', 'fitness', 'cooking', 'other'])
    .withMessage('Invalid skill category'),
  body('experienceLevel')
    .optional()
    .isIn(['beginner', 'intermediate', 'advanced', 'expert'])
    .withMessage('Invalid experience level'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Description cannot exceed 200 characters')
];

const validateSearch = [
  query('q')
    .notEmpty()
    .withMessage('Search query is required')
    .isLength({ min: 2 })
    .withMessage('Search query must be at least 2 characters long')
];

const validateGetSkills = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('category')
    .optional()
    .isIn(['programming', 'design', 'marketing', 'writing', 'music', 'language', 'business', 'fitness', 'cooking', 'other'])
    .withMessage('Invalid skill category'),
  query('experienceLevel')
    .optional()
    .isIn(['beginner', 'intermediate', 'advanced', 'expert'])
    .withMessage('Invalid experience level')
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
 * @desc    Get all skills with pagination and filters
 * @route   GET /api/skills
 * @access  Public
 */
router.get('/', validateGetSkills, handleValidationErrors, getSkills);

/**
 * @desc    Get skill categories
 * @route   GET /api/skills/categories
 * @access  Public
 */
router.get('/categories', getCategories);

/**
 * @desc    Get skills by category
 * @route   GET /api/skills/category/:category
 * @access  Public
 */
router.get('/category/:category', getSkillsByCategory);

/**
 * @desc    Search skills
 * @route   GET /api/skills/search
 * @access  Public
 */
router.get('/search', validateSearch, handleValidationErrors, searchSkills);

/**
 * @desc    Get popular skills
 * @route   GET /api/skills/popular
 * @access  Public
 */
router.get('/popular', getPopularSkills);

/**
 * @desc    Add skill to user profile
 * @route   POST /api/skills
 * @access  Private
 */
router.post('/', protect, validateAddSkill, handleValidationErrors, addSkill);

/**
 * @desc    Update skill
 * @route   PUT /api/skills/:id
 * @access  Private
 */
router.put('/:id', protect, validateUpdateSkill, handleValidationErrors, updateSkill);

/**
 * @desc    Remove skill
 * @route   DELETE /api/skills/:id
 * @access  Private
 */
router.delete('/:id', protect, removeSkill);

module.exports = router;
