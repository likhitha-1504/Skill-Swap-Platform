const User = require('../models/User');

/**
 * Skills Controller
 * Handles skill management, search, and statistics
 */

/**
 * @desc    Get all skills with pagination and filters
 * @route   GET /api/skills
 * @access  Public
 */
const getSkills = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      category,
      experienceLevel,
      sortBy = 'name',
      sortOrder = 'asc'
    } = req.query;

    const skip = (page - 1) * limit;
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Build aggregation pipeline
    const pipeline = [
      { $match: { isActive: true } },
      { $unwind: '$skillsOffered' }
    ];

    // Add filters
    if (category) {
      pipeline.push({
        $match: { 'skillsOffered.category': category }
      });
    }

    if (experienceLevel) {
      pipeline.push({
        $match: { 'skillsOffered.experienceLevel': experienceLevel }
      });
    }

    // Sort and paginate
    pipeline.push(
      { $sort: { [`skillsOffered.${sortBy}`]: sortOrder === 'desc' ? -1 : 1 } },
      { $skip: skip },
      { $limit: parseInt(limit) }
    );

    // Project final shape
    pipeline.push({
      $project: {
        _id: 0,
        skill: '$skillsOffered',
        user: {
          _id: '$_id',
          name: '$name',
          avatar: '$avatar',
          location: '$location',
          rating: '$rating',
          totalSwaps: '$totalSwaps',
          completedSwaps: '$completedSwaps'
        }
      }
    });

    const skills = await User.aggregate(pipeline);

    // Get total count for pagination
    const countPipeline = [
      { $match: { isActive: true } },
      { $unwind: '$skillsOffered' }
    ];

    if (category) {
      countPipeline.push({
        $match: { 'skillsOffered.category': category }
      });
    }

    if (experienceLevel) {
      countPipeline.push({
        $match: { 'skillsOffered.experienceLevel': experienceLevel }
      });
    }

    countPipeline.push({ $count: 'total' });
    const countResult = await User.aggregate(countPipeline);
    const total = countResult[0]?.total || 0;

    res.status(200).json({
      success: true,
      data: {
        skills,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      },
      message: 'Skills retrieved successfully'
    });
  } catch (error) {
    console.error('Get skills error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get skills',
      message: error.message
    });
  }
};

/**
 * @desc    Get skill categories
 * @route   GET /api/skills/categories
 * @access  Public
 */
const getCategories = async (req, res) => {
  try {
    const categories = [
      { value: 'programming', label: 'Programming', count: 0 },
      { value: 'design', label: 'Design', count: 0 },
      { value: 'marketing', label: 'Marketing', count: 0 },
      { value: 'writing', label: 'Writing', count: 0 },
      { value: 'music', label: 'Music', count: 0 },
      { value: 'language', label: 'Language', count: 0 },
      { value: 'business', label: 'Business', count: 0 },
      { value: 'fitness', label: 'Fitness', count: 0 },
      { value: 'cooking', label: 'Cooking', count: 0 },
      { value: 'other', label: 'Other', count: 0 }
    ];

    // Get counts for each category
    const categoryCounts = await User.aggregate([
      { $match: { isActive: true } },
      { $unwind: '$skillsOffered' },
      {
        $group: {
          _id: '$skillsOffered.category',
          count: { $sum: 1 }
        }
      }
    ]);

    // Update counts
    categoryCounts.forEach(category => {
      const count = categoryCounts.find(c => c._id === category.value);
      category.count = count ? count.count : 0;
    });

    res.status(200).json({
      success: true,
      data: categories,
      message: 'Categories retrieved successfully'
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get categories',
      message: error.message
    });
  }
};

/**
 * @desc    Get skills by category
 * @route   GET /api/skills/category/:category
 * @access  Public
 */
const getSkillsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const validCategories = [
      'programming', 'design', 'marketing', 'writing', 'music', 
      'language', 'business', 'fitness', 'cooking', 'other'
    ];

    if (!validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid category',
        message: 'Please provide a valid skill category'
      });
    }

    const skip = (page - 1) * limit;

    const pipeline = [
      { $match: { isActive: true } },
      { $unwind: '$skillsOffered' },
      { $match: { 'skillsOffered.category': category } },
      { $sort: { 'skillsOffered.name': 1 } },
      { $skip: skip },
      { $limit: parseInt(limit) },
      {
        $project: {
          _id: 0,
          skill: '$skillsOffered',
          user: {
            _id: '$_id',
            name: '$name',
            avatar: '$avatar',
            location: '$location',
            rating: '$rating'
          }
        }
      }
    ];

    const skills = await User.aggregate(pipeline);

    const countPipeline = [
      { $match: { isActive: true } },
      { $unwind: '$skillsOffered' },
      { $match: { 'skillsOffered.category': category } },
      { $count: 'total' }
    ];

    const countResult = await User.aggregate(countPipeline);
    const total = countResult[0]?.total || 0;

    res.status(200).json({
      success: true,
      data: {
        skills,
        category,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      },
      message: 'Skills by category retrieved successfully'
    });
  } catch (error) {
    console.error('Get skills by category error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get skills by category',
      message: error.message
    });
  }
};

/**
 * @desc    Search skills
 * @route   GET /api/skills/search
 * @access  Public
 */
const searchSkills = async (req, res) => {
  try {
    const { q, page = 1, limit = 20, category } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        error: 'Missing query',
        message: 'Search query is required'
      });
    }

    const skip = (page - 1) * limit;

    const pipeline = [
      { $match: { isActive: true } },
      { $unwind: '$skillsOffered' },
      {
        $match: {
          'skillsOffered.name': { $regex: q, $options: 'i' }
        }
      }
    ];

    if (category) {
      pipeline.push({
        $match: { 'skillsOffered.category': category }
      });
    }

    pipeline.push(
      { $sort: { 'skillsOffered.name': 1 } },
      { $skip: skip },
      { $limit: parseInt(limit) },
      {
        $project: {
          _id: 0,
          skill: '$skillsOffered',
          user: {
            _id: '$_id',
            name: '$name',
            avatar: '$avatar',
            location: '$location',
            rating: '$rating'
          }
        }
      }
    );

    const skills = await User.aggregate(pipeline);

    const countPipeline = [
      { $match: { isActive: true } },
      { $unwind: '$skillsOffered' },
      {
        $match: {
          'skillsOffered.name': { $regex: q, $options: 'i' }
        }
      }
    ];

    if (category) {
      countPipeline.push({
        $match: { 'skillsOffered.category': category }
      });
    }

    countPipeline.push({ $count: 'total' });
    const countResult = await User.aggregate(countPipeline);
    const total = countResult[0]?.total || 0;

    res.status(200).json({
      success: true,
      data: {
        skills,
        query: q,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      },
      message: 'Skills searched successfully'
    });
  } catch (error) {
    console.error('Search skills error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search skills',
      message: error.message
    });
  }
};

/**
 * @desc    Get popular skills
 * @route   GET /api/skills/popular
 * @access  Public
 */
const getPopularSkills = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const pipeline = [
      { $match: { isActive: true } },
      { $unwind: '$skillsOffered' },
      {
        $group: {
          _id: '$skillsOffered.name',
          category: { $first: '$skillsOffered.category' },
          count: { $sum: 1 },
          users: { $push: { name: '$name', rating: '$rating' } }
        }
      },
      { $sort: { count: -1 } },
      { $limit: parseInt(limit) },
      {
        $project: {
          _id: 0,
          name: '$_id',
          category: '$category',
          count: '$count',
          averageRating: { $avg: '$users.rating.average' }
        }
      }
    ];

    const skills = await User.aggregate(pipeline);

    res.status(200).json({
      success: true,
      data: skills,
      message: 'Popular skills retrieved successfully'
    });
  } catch (error) {
    console.error('Get popular skills error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get popular skills',
      message: error.message
    });
  }
};

/**
 * @desc    Add skill to user profile
 * @route   POST /api/skills
 * @access  Private
 */
const addSkill = async (req, res) => {
  try {
    const { name, category, experienceLevel, description } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        message: 'User not found'
      });
    }

    // Check if skill already exists
    const existingSkill = user.skillsOffered.find(
      skill => skill.name.toLowerCase() === name.toLowerCase()
    );

    if (existingSkill) {
      return res.status(400).json({
        success: false,
        error: 'Skill already exists',
        message: 'You already offer this skill'
      });
    }

    // Add skill
    const newSkill = {
      name: name.trim(),
      category,
      experienceLevel: experienceLevel || 'intermediate',
      description: description ? description.trim() : ''
    };

    user.skillsOffered.push(newSkill);
    await user.save();

    res.status(201).json({
      success: true,
      data: newSkill,
      message: 'Skill added successfully'
    });
  } catch (error) {
    console.error('Add skill error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add skill',
      message: error.message
    });
  }
};

/**
 * @desc    Update skill
 * @route   PUT /api/skills/:id
 * @access  Private
 */
const updateSkill = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, experienceLevel, description } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        message: 'User not found'
      });
    }

    // Find skill
    const skillIndex = user.skillsOffered.findIndex(
      skill => skill._id.toString() === id
    );

    if (skillIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Skill not found',
        message: 'Skill not found in your profile'
      });
    }

    // Update skill
    if (name) user.skillsOffered[skillIndex].name = name.trim();
    if (category) user.skillsOffered[skillIndex].category = category;
    if (experienceLevel) user.skillsOffered[skillIndex].experienceLevel = experienceLevel;
    if (description !== undefined) user.skillsOffered[skillIndex].description = description.trim();

    await user.save();

    res.status(200).json({
      success: true,
      data: user.skillsOffered[skillIndex],
      message: 'Skill updated successfully'
    });
  } catch (error) {
    console.error('Update skill error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update skill',
      message: error.message
    });
  }
};

/**
 * @desc    Remove skill
 * @route   DELETE /api/skills/:id
 * @access  Private
 */
const removeSkill = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        message: 'User not found'
      });
    }

    // Find and remove skill
    const skillIndex = user.skillsOffered.findIndex(
      skill => skill._id.toString() === id
    );

    if (skillIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Skill not found',
        message: 'Skill not found in your profile'
      });
    }

    const removedSkill = user.skillsOffered.splice(skillIndex, 1)[0];
    await user.save();

    res.status(200).json({
      success: true,
      data: removedSkill,
      message: 'Skill removed successfully'
    });
  } catch (error) {
    console.error('Remove skill error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to remove skill',
      message: error.message
    });
  }
};

module.exports = {
  getSkills,
  getCategories,
  getSkillsByCategory,
  searchSkills,
  getPopularSkills,
  addSkill,
  updateSkill,
  removeSkill
};
