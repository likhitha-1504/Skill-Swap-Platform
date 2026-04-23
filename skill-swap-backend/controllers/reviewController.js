const Review = require('../models/Review');
const SwapRequest = require('../models/SwapRequest');
const User = require('../models/User');

/**
 * Review Controller
 * Handles review and rating functionality
 */

/**
 * @desc    Get reviews for a user
 * @route   GET /api/reviews/user/:userId
 * @access  Public
 */
const getReviews = async (req, res) => {
  try {
    const { userId } = req.params;
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      rating,
      isPublic = true
    } = req.query;

    const reviews = await Review.getUserReviews(userId, {
      page: parseInt(page),
      limit: parseInt(limit),
      sortBy,
      sortOrder: sortOrder === 'desc' ? -1 : 1,
      rating,
      isPublic: isPublic === 'true'
    });

    // Get total count
    const countQuery = { reviewee: userId };
    if (rating) countQuery.rating = rating;
    if (isPublic !== undefined) countQuery.isPublic = isPublic === 'true';
    
    const total = await Review.countDocuments(countQuery);

    res.status(200).json({
      success: true,
      data: {
        reviews,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      },
      message: 'Reviews retrieved successfully'
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get reviews',
      message: error.message
    });
  }
};

/**
 * @desc    Get user's average rating
 * @route   GET /api/reviews/user/:userId/rating
 * @access  Public
 */
const getUserRating = async (req, res) => {
  try {
    const { userId } = req.params;

    const stats = await Review.getUserRatingStats(userId);

    res.status(200).json({
      success: true,
      data: stats,
      message: 'User rating retrieved successfully'
    });
  } catch (error) {
    console.error('Get user rating error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user rating',
      message: error.message
    });
  }
};

/**
 * @desc    Get reviews given by user
 * @route   GET /api/reviews/given/:userId
 * @access  Private
 */
const getGivenReviews = async (req, res) => {
  try {
    const { userId } = req.params;
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Check if user is requesting their own reviews
    if (userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        message: 'You can only view reviews you gave'
      });
    }

    const reviews = await Review.getGivenReviews(userId, {
      page: parseInt(page),
      limit: parseInt(limit),
      sortBy,
      sortOrder: sortOrder === 'desc' ? -1 : 1
    });

    // Get total count
    const total = await Review.countDocuments({ reviewer: userId });

    res.status(200).json({
      success: true,
      data: {
        reviews,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      },
      message: 'Given reviews retrieved successfully'
    });
  } catch (error) {
    console.error('Get given reviews error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get given reviews',
      message: error.message
    });
  }
};

/**
 * @desc    Get reviews received by user
 * @route   GET /api/reviews/received/:userId
 * @access  Private
 */
const getReceivedReviews = async (req, res) => {
  try {
    const { userId } = req.params;
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Check if user is requesting their own reviews
    if (userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        message: 'You can only view reviews you received'
      });
    }

    const reviews = await Review.getUserReviews(userId, {
      page: parseInt(page),
      limit: parseInt(limit),
      sortBy,
      sortOrder: sortOrder === 'desc' ? -1 : 1,
      isPublic: true
    });

    // Get total count
    const total = await Review.countDocuments({ reviewee: userId, isPublic: true });

    res.status(200).json({
      success: true,
      data: {
        reviews,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      },
      message: 'Received reviews retrieved successfully'
    });
  } catch (error) {
    console.error('Get received reviews error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get received reviews',
      message: error.message
    });
  }
};

/**
 * @desc    Create review
 * @route   POST /api/reviews
 * @access  Private
 */
const createReview = async (req, res) => {
  try {
    const {
      reviewee,
      swapRequest,
      rating,
      title,
      comment,
      skillsExchanged,
      wouldSwapAgain,
      communicationRating,
      punctualityRating,
      skillQualityRating,
      isPublic = true
    } = req.body;

    // Check if swap request exists and is completed
    const swapRequestDoc = await SwapRequest.findById(swapRequest);
    if (!swapRequestDoc) {
      return res.status(404).json({
        success: false,
        error: 'Swap request not found',
        message: 'Swap request not found'
      });
    }

    if (swapRequestDoc.status !== 'completed') {
      return res.status(400).json({
        success: false,
        error: 'Cannot review',
        message: 'You can only review completed swap requests'
      });
    }

    // Check if user is involved in the swap request
    if (swapRequestDoc.requester.toString() !== req.user.id && 
        swapRequestDoc.recipient.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        message: 'You can only review swap requests you are involved in'
      });
    }

    // Check if user is reviewing the other person (not themselves)
    if (reviewee === req.user.id) {
      return res.status(400).json({
        success: false,
        error: 'Cannot review yourself',
        message: 'You cannot review yourself'
      });
    }

    // Check if reviewee is the other person in the swap request
    const otherUserId = swapRequestDoc.requester.toString() === req.user.id 
      ? swapRequestDoc.recipient.toString() 
      : swapRequestDoc.requester.toString();

    if (reviewee !== otherUserId) {
      return res.status(400).json({
        success: false,
        error: 'Invalid reviewee',
        message: 'You can only review the other person in the swap request'
      });
    }

    // Check if review already exists
    const existingReview = await Review.findOne({
      swapRequest,
      reviewer: req.user.id
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        error: 'Review already exists',
        message: 'You have already reviewed this swap request'
      });
    }

    // Create review
    const review = await Review.create({
      reviewer: req.user.id,
      reviewee,
      swapRequest,
      rating,
      title,
      comment,
      skillsExchanged: skillsExchanged || [],
      wouldSwapAgain,
      communicationRating,
      punctualityRating,
      skillQualityRating,
      isPublic
    });

    // Populate review details
    const populatedReview = await Review.findById(review._id)
      .populate('reviewer', 'name avatar')
      .populate('reviewee', 'name avatar')
      .populate('swapRequest', 'skillOffered skillWanted');

    res.status(201).json({
      success: true,
      data: populatedReview,
      message: 'Review created successfully'
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create review',
      message: error.message
    });
  }
};

/**
 * @desc    Update review
 * @route   PUT /api/reviews/:id
 * @access  Private
 */
const updateReview = async (req, res) => {
  try {
    const {
      rating,
      title,
      comment,
      skillsExchanged,
      wouldSwapAgain,
      communicationRating,
      punctualityRating,
      skillQualityRating,
      isPublic
    } = req.body;

    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({
        success: false,
        error: 'Review not found',
        message: 'Review not found'
      });
    }

    // Check if user is the reviewer
    if (review.reviewer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        message: 'You can only update reviews you created'
      });
    }

    // Check if review can be edited (within 24 hours)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    if (review.createdAt < twentyFourHoursAgo) {
      return res.status(400).json({
        success: false,
        error: 'Cannot edit',
        message: 'You can only edit reviews within 24 hours of creation'
      });
    }

    // Update fields
    if (rating !== undefined) review.rating = rating;
    if (title !== undefined) review.title = title;
    if (comment !== undefined) review.comment = comment;
    if (skillsExchanged !== undefined) review.skillsExchanged = skillsExchanged;
    if (wouldSwapAgain !== undefined) review.wouldSwapAgain = wouldSwapAgain;
    if (communicationRating !== undefined) review.communicationRating = communicationRating;
    if (punctualityRating !== undefined) review.punctualityRating = punctualityRating;
    if (skillQualityRating !== undefined) review.skillQualityRating = skillQualityRating;
    if (isPublic !== undefined) review.isPublic = isPublic;

    await review.save();

    // Populate updated review
    const populatedReview = await Review.findById(review._id)
      .populate('reviewer', 'name avatar')
      .populate('reviewee', 'name avatar')
      .populate('swapRequest', 'skillOffered skillWanted');

    res.status(200).json({
      success: true,
      data: populatedReview,
      message: 'Review updated successfully'
    });
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update review',
      message: error.message
    });
  }
};

/**
 * @desc    Delete review
 * @route   DELETE /api/reviews/:id
 * @access  Private
 */
const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({
        success: false,
        error: 'Review not found',
        message: 'Review not found'
      });
    }

    // Check if user is the reviewer
    if (review.reviewer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        message: 'You can only delete reviews you created'
      });
    }

    // Check if review can be deleted (within 24 hours)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    if (review.createdAt < twentyFourHoursAgo) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete',
        message: 'You can only delete reviews within 24 hours of creation'
      });
    }

    await Review.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      data: review,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete review',
      message: error.message
    });
  }
};

module.exports = {
  getReviews,
  getUserRating,
  getGivenReviews,
  getReceivedReviews,
  createReview,
  updateReview,
  deleteReview
};
