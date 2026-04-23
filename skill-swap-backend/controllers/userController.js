const User = require('../models/User');
const SwapRequest = require('../models/SwapRequest');
const Review = require('../models/Review');

/**
 * User Controller
 * Handles user management, search, and statistics
 */

/**
 * @desc    Get all users with pagination and filters
 * @route   GET /api/users
 * @access  Private
 */
const getUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      skillCategory,
      experienceLevel,
      availability,
      search
    } = req.query;

    const skip = (page - 1) * limit;
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Build query
    let query = {
      isActive: true,
      _id: { $ne: req.user.id } // Exclude current user
    };

    // Add filters
    if (skillCategory) {
      query.$or = [
        { 'skillsOffered.category': skillCategory },
        { 'skillsWanted.category': skillCategory }
      ];
    }

    if (experienceLevel) {
      query.experienceLevel = experienceLevel;
    }

    if (availability) {
      query.availability = availability;
    }

    // Add search
    if (search) {
      query.$and = query.$and || [];
      query.$and.push({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { bio: { $regex: search, $options: 'i' } },
          { location: { $regex: search, $options: 'i' } },
          { 'skillsOffered.name': { $regex: search, $options: 'i' } },
          { 'skillsWanted.name': { $regex: search, $options: 'i' } }
        ]
      });
    }

    // Execute query
    const users = await User.find(query)
      .select('-password')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      },
      message: 'Users retrieved successfully'
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get users',
      message: error.message
    });
  }
};

/**
 * @desc    Get user by ID
 * @route   GET /api/users/:id
 * @access  Private
 */
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate({
        path: 'skillsOffered',
        select: 'name category experienceLevel description'
      })
      .populate({
        path: 'skillsWanted',
        select: 'name category description'
      });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        message: 'User not found'
      });
    }

    // Don't return inactive users unless it's the current user
    if (!user.isActive && user._id.toString() !== req.user.id) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user,
      message: 'User retrieved successfully'
    });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user',
      message: error.message
    });
  }
};

/**
 * @desc    Update user
 * @route   PUT /api/users/:id
 * @access  Private (Admin or own user)
 */
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, location, bio, experienceLevel, skillsOffered, skillsWanted, availability, isActive } = req.body;

    // Check permissions (users can only update their own profile)
    if (id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        message: 'You can only update your own profile'
      });
    }

    // Find user
    let user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        message: 'User not found'
      });
    }

    // Update fields
    if (name) user.name = name.trim();
    if (location !== undefined) user.location = location.trim();
    if (bio !== undefined) user.bio = bio.trim();
    if (experienceLevel) user.experienceLevel = experienceLevel;
    if (availability) user.availability = availability;
    if (skillsOffered) user.skillsOffered = skillsOffered;
    if (skillsWanted) user.skillsWanted = skillsWanted;
    
    // Only admin can update isActive
    if (isActive !== undefined && req.user.role === 'admin') {
      user.isActive = isActive;
    }

    // Save updated user
    user = await user.save();

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        location: user.location,
        bio: user.bio,
        experienceLevel: user.experienceLevel,
        skillsOffered: user.skillsOffered,
        skillsWanted: user.skillsWanted,
        rating: user.rating,
        totalSwaps: user.totalSwaps,
        completedSwaps: user.completedSwaps,
        availability: user.availability,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      },
      message: 'User updated successfully'
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update user',
      message: error.message
    });
  }
};

/**
 * @desc    Delete user
 * @route   DELETE /api/users/:id
 * @access  Private (Admin or own user)
 */
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Check permissions
    if (id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        message: 'You can only delete your own account'
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        message: 'User not found'
      });
    }

    // Soft delete by setting isActive to false
    user.isActive = false;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete user',
      message: error.message
    });
  }
};

/**
 * @desc    Search users
 * @route   GET /api/users/search
 * @access  Private
 */
const searchUsers = async (req, res) => {
  try {
    const { q, page = 1, limit = 10 } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        error: 'Missing query',
        message: 'Search query is required'
      });
    }

    const skip = (page - 1) * limit;

    const users = await User.searchUsers(q, {
      page: parseInt(page),
      limit: parseInt(limit),
      sortBy: 'rating.average',
      sortOrder: -1
    });

    const total = await User.countDocuments({
      isActive: true,
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { bio: { $regex: q, $options: 'i' } },
        { location: { $regex: q, $options: 'i' } },
        { 'skillsOffered.name': { $regex: q, $options: 'i' } },
        { 'skillsWanted.name': { $regex: q, $options: 'i' } }
      ]
    });

    res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      },
      message: 'Users searched successfully'
    });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search users',
      message: error.message
    });
  }
};

/**
 * @desc    Get user statistics
 * @route   GET /api/users/:id/stats
 * @access  Private
 */
const getUserStats = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        message: 'User not found'
      });
    }

    // Get swap statistics
    const swapStats = await SwapRequest.aggregate([
      {
        $match: {
          $or: [{ requester: user._id }, { recipient: user._id }]
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get review statistics
    const reviewStats = await Review.getUserRatingStats(user._id);

    // Get skills statistics
    const skillsOffered = user.skillsOffered.length;
    const skillsWanted = user.skillsWanted.length;

    const stats = {
      totalSwaps: user.totalSwaps,
      completedSwaps: user.completedSwaps,
      pendingRequests: swapStats.find(s => s._id === 'pending')?.count || 0,
      activeSwaps: swapStats.find(s => s._id === 'accepted')?.count || 0,
      averageRating: reviewStats.averageRating,
      totalReviews: reviewStats.totalReviews,
      skillsOffered,
      skillsWanted,
      profileCompletion: user.profileCompletion,
      joinDate: user.createdAt,
      lastLogin: user.lastLogin
    };

    res.status(200).json({
      success: true,
      data: stats,
      message: 'User statistics retrieved successfully'
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user statistics',
      message: error.message
    });
  }
};

/**
 * @desc    Find skill matches for user
 * @route   GET /api/users/:id/matches
 * @access  Private
 */
const getSkillMatches = async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 10 } = req.query;

    // Check if user is requesting their own matches
    if (id !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        message: 'You can only view your own skill matches'
      });
    }

    const matches = await User.findSkillMatches(id, parseInt(limit));

    res.status(200).json({
      success: true,
      data: matches,
      message: 'Skill matches retrieved successfully'
    });
  } catch (error) {
    console.error('Get skill matches error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get skill matches',
      message: error.message
    });
  }
};

/**
 * @desc    Upload avatar
 * @route   POST /api/users/:id/avatar
 * @access  Private
 */
const uploadAvatar = async (req, res) => {
  try {
    const { id } = req.params;

    // Check permissions
    if (id !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        message: 'You can only upload your own avatar'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded',
        message: 'Please upload an image file'
      });
    }

    // For now, we'll just store the file path
    // In production, you'd upload to cloud storage
    const avatarUrl = `/uploads/${req.file.filename}`;

    const user = await User.findByIdAndUpdate(
      id,
      { avatar: avatarUrl },
      { new: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      data: user,
      message: 'Avatar uploaded successfully'
    });
  } catch (error) {
    console.error('Upload avatar error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload avatar',
      message: error.message
    });
  }
};

module.exports = {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  searchUsers,
  getUserStats,
  getSkillMatches,
  uploadAvatar
};
