const mongoose = require('mongoose');

/**
 * Review Schema
 * Represents a review and rating given by a user to another user after a completed swap
 */
const reviewSchema = new mongoose.Schema({
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Reviewer is required']
  },
  reviewee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Reviewee is required']
  },
  swapRequest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SwapRequest',
    required: [true, 'Swap request is required']
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },
  title: {
    type: String,
    required: [true, 'Review title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  comment: {
    type: String,
    required: [true, 'Review comment is required'],
    trim: true,
    maxlength: [500, 'Comment cannot exceed 500 characters']
  },
  skillsExchanged: [{
    offered: {
      type: String,
      required: true,
      trim: true
    },
    wanted: {
      type: String,
      required: true,
      trim: true
    }
  }],
  wouldSwapAgain: {
    type: Boolean,
    required: [true, 'Would swap again is required']
  },
  communicationRating: {
    type: Number,
    min: [1, 'Communication rating must be at least 1'],
    max: [5, 'Communication rating cannot exceed 5']
  },
  punctualityRating: {
    type: Number,
    min: [1, 'Punctuality rating must be at least 1'],
    max: [5, 'Punctuality rating cannot exceed 5']
  },
  skillQualityRating: {
    type: Number,
    min: [1, 'Skill quality rating must be at least 1'],
    max: [5, 'Skill quality rating cannot exceed 5']
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  helpfulCount: {
    type: Number,
    default: 0,
    min: 0
  },
  response: {
    content: {
      type: String,
      maxlength: [500, 'Response cannot exceed 500 characters']
    },
    createdAt: {
      type: Date,
      default: null
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
reviewSchema.index({ reviewer: 1 });
reviewSchema.index({ reviewee: 1 });
reviewSchema.index({ swapRequest: 1 });
reviewSchema.index({ rating: 1 });
reviewSchema.index({ createdAt: -1 });
reviewSchema.index({ isPublic: 1 });

// Compound indexes
reviewSchema.index({ reviewee: 1, createdAt: -1 });
reviewSchema.index({ reviewer: 1, reviewee: 1 });
reviewSchema.index({ swapRequest: 1, reviewer: 1 });

// Unique index to prevent duplicate reviews
reviewSchema.index({ swapRequest: 1, reviewer: 1 }, { unique: true });

// Virtual for average rating calculation
reviewSchema.virtual('averageRating').get(function() {
  const ratings = [
    this.rating,
    this.communicationRating,
    this.punctualityRating,
    this.skillQualityRating
  ].filter(rating => rating !== undefined);
  
  if (ratings.length === 0) return this.rating;
  
  return (ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length).toFixed(1);
});

// Virtual for review summary
reviewSchema.virtual('summary').get(function() {
  return {
    rating: this.rating,
    averageRating: this.averageRating,
    wouldSwapAgain: this.wouldSwapAgain,
    skillsExchanged: this.skillsExchanged
  };
});

// Pre-save middleware
reviewSchema.pre('save', function(next) {
  // Prevent self-review
  if (this.reviewer.toString() === this.reviewee.toString()) {
    const error = new Error('Cannot review yourself');
    return next(error);
  }
  
  // Validate ratings
  const ratings = [this.rating, this.communicationRating, this.punctualityRating, this.skillQualityRating];
  for (const rating of ratings) {
    if (rating !== undefined && (rating < 1 || rating > 5)) {
      const error = new Error('All ratings must be between 1 and 5');
      return next(error);
    }
  }
  
  // Trim string fields
  const stringFields = ['title', 'comment'];
  stringFields.forEach(field => {
    if (this[field]) {
      this[field] = this[field].trim();
    }
  });
  
  // Clean skills exchanged
  if (this.skillsExchanged) {
    this.skillsExchanged = this.skillsExchanged
      .map(skill => ({
        offered: skill.offered.trim(),
        wanted: skill.wanted.trim()
      }))
      .filter(skill => skill.offered && skill.wanted);
  }
  
  next();
});

// Post-save middleware to update user ratings
reviewSchema.post('save', async function() {
  try {
    const User = mongoose.model('User');
    
    // Update reviewee's rating
    const allReviews = await this.constructor.find({ 
      reviewee: this.reviewee,
      isPublic: true 
    });
    
    if (allReviews.length > 0) {
      const totalRating = allReviews.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = totalRating / allReviews.length;
      
      await User.findByIdAndUpdate(this.reviewee, {
        'rating.average': averageRating,
        'rating.count': allReviews.length
      });
    }
  } catch (error) {
    console.error('Error updating user ratings:', error);
  }
});

// Static method to get user reviews
reviewSchema.statics.getUserReviews = async (userId, options = {}) => {
  const {
    page = 1,
    limit = 10,
    sortBy = 'createdAt',
    sortOrder = -1,
    rating,
    isPublic = true
  } = options;
  
  const skip = (page - 1) * limit;
  
  // Build query
  const query = { reviewee: userId };
  
  if (rating) {
    query.rating = rating;
  }
  
  if (isPublic !== undefined) {
    query.isPublic = isPublic;
  }
  
  return this.find(query)
    .populate('reviewer', 'name avatar')
    .sort({ [sortBy]: sortOrder })
    .skip(skip)
    .limit(limit);
};

// Static method to get reviews given by user
reviewSchema.statics.getGivenReviews = async (userId, options = {}) => {
  const {
    page = 1,
    limit = 10,
    sortBy = 'createdAt',
    sortOrder = -1
  } = options;
  
  const skip = (page - 1) * limit;
  
  return this.find({ reviewer: userId })
    .populate('reviewee', 'name avatar')
    .sort({ [sortBy]: sortOrder })
    .skip(skip)
    .limit(limit);
};

// Static method to get user rating statistics
reviewSchema.statics.getUserRatingStats = async (userId) => {
  const stats = await this.aggregate([
    { $match: { reviewee: userId, isPublic: true } },
    {
      $group: {
        _id: '$rating',
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);
  
  const totalReviews = stats.reduce((sum, stat) => sum + stat.count, 0);
  const averageRating = stats.reduce((sum, stat) => sum + (stat._id * stat.count), 0) / totalReviews;
  
  return {
    totalReviews,
    averageRating: averageRating || 0,
    ratingDistribution: stats
  };
};

// Static method to check if user can review swap
reviewSchema.statics.canReviewSwap = async (swapRequestId, userId) => {
  const existingReview = await this.findOne({
    swapRequest: swapRequestId,
    reviewer: userId
  });
  
  return !existingReview;
};

// Instance method to mark as helpful
reviewSchema.methods.markAsHelpful = function() {
  this.helpfulCount += 1;
  return this.save();
};

// Instance method to add response
reviewSchema.methods.addResponse = function(responseContent) {
  this.response = {
    content: responseContent.trim(),
    createdAt: new Date()
  };
  return this.save();
};

// Instance method to toggle verification
reviewSchema.methods.toggleVerification = function() {
  this.isVerified = !this.isVerified;
  return this.save();
};

// Instance method to toggle visibility
reviewSchema.methods.toggleVisibility = function() {
  this.isPublic = !this.isPublic;
  return this.save();
};

module.exports = mongoose.model('Review', reviewSchema);
