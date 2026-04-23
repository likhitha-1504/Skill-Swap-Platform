const mongoose = require('mongoose');

/**
 * Swap Request Schema
 * Represents a skill swap request between users
 */
const swapRequestSchema = new mongoose.Schema({
  requester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Requester is required']
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Recipient is required']
  },
  skillOffered: {
    name: {
      type: String,
      required: [true, 'Skill offered name is required'],
      trim: true,
      maxlength: [50, 'Skill name cannot exceed 50 characters']
    },
    category: {
      type: String,
      required: [true, 'Skill category is required'],
      enum: [
        'programming',
        'design',
        'marketing',
        'writing',
        'music',
        'language',
        'business',
        'fitness',
        'cooking',
        'other'
      ]
    },
    description: {
      type: String,
      maxlength: [200, 'Description cannot exceed 200 characters'],
      trim: true,
      default: ''
    }
  },
  skillWanted: {
    name: {
      type: String,
      required: [true, 'Skill wanted name is required'],
      trim: true,
      maxlength: [50, 'Skill name cannot exceed 50 characters']
    },
    category: {
      type: String,
      required: [true, 'Skill category is required'],
      enum: [
        'programming',
        'design',
        'marketing',
        'writing',
        'music',
        'language',
        'business',
        'fitness',
        'cooking',
        'other'
      ]
    },
    description: {
      type: String,
      maxlength: [200, 'Description cannot exceed 200 characters'],
      trim: true,
      default: ''
    }
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'cancelled', 'completed'],
    default: 'pending'
  },
  message: {
    type: String,
    maxlength: [500, 'Message cannot exceed 500 characters'],
    trim: true,
    default: ''
  },
  scheduledDate: {
    type: Date,
    validate: {
      validator: function(value) {
        return !value || value > new Date();
      },
      message: 'Scheduled date must be in the future'
    }
  },
  duration: {
    type: Number, // in minutes
    min: [15, 'Duration must be at least 15 minutes'],
    max: [480, 'Duration cannot exceed 8 hours (480 minutes)'],
    default: 60
  },
  location: {
    type: String,
    maxlength: [200, 'Location cannot exceed 200 characters'],
    trim: true,
    default: ''
  },
  isOnline: {
    type: Boolean,
    default: false
  },
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot exceed 1000 characters'],
    trim: true,
    default: ''
  },
  completedAt: {
    type: Date,
    default: null
  },
  cancelledAt: {
    type: Date,
    default: null
  },
  rejectedAt: {
    type: Date,
    default: null
  },
  rejectedReason: {
    type: String,
    maxlength: [200, 'Rejection reason cannot exceed 200 characters'],
    trim: true,
    default: ''
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
swapRequestSchema.index({ requester: 1 });
swapRequestSchema.index({ recipient: 1 });
swapRequestSchema.index({ status: 1 });
swapRequestSchema.index({ createdAt: -1 });
swapRequestSchema.index({ 'skillOffered.category': 1 });
swapRequestSchema.index({ 'skillWanted.category': 1 });

// Compound indexes
swapRequestSchema.index({ requester: 1, status: 1 });
swapRequestSchema.index({ recipient: 1, status: 1 });
swapRequestSchema.index({ requester: 1, recipient: 1 });

// Virtual for checking if request can be cancelled
swapRequestSchema.virtual('canBeCancelled').get(function() {
  return this.status === 'pending';
});

// Virtual for checking if request can be accepted
swapRequestSchema.virtual('canBeAccepted').get(function() {
  return this.status === 'pending';
});

// Virtual for checking if request can be rejected
swapRequestSchema.virtual('canBeRejected').get(function() {
  return this.status === 'pending';
});

// Virtual for checking if request can be completed
swapRequestSchema.virtual('canBeCompleted').get(function() {
  return this.status === 'accepted';
});

// Virtual for time until scheduled date
swapRequestSchema.virtual('timeUntilScheduled').get(function() {
  if (!this.scheduledDate) return null;
  const now = new Date();
  const diff = this.scheduledDate - now;
  
  if (diff <= 0) return 'Overdue';
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days} day${days > 1 ? 's' : ''}`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''}`;
  return 'Less than 1 hour';
});

// Pre-save middleware
swapRequestSchema.pre('save', function(next) {
  // Prevent self-swaps
  if (this.requester.toString() === this.recipient.toString()) {
    const error = new Error('Cannot create swap request with yourself');
    return next(error);
  }
  
  // Set timestamps based on status changes
  const now = new Date();
  
  if (this.isModified('status')) {
    switch (this.status) {
      case 'completed':
        this.completedAt = now;
        break;
      case 'cancelled':
        this.cancelledAt = now;
        break;
      case 'rejected':
        this.rejectedAt = now;
        break;
    }
  }
  
  // Trim string fields
  const stringFields = ['message', 'location', 'notes', 'rejectedReason'];
  stringFields.forEach(field => {
    if (this[field]) {
      this[field] = this[field].trim();
    }
  });
  
  // Clean skill fields
  if (this.skillOffered) {
    this.skillOffered.name = this.skillOffered.name.trim();
    if (this.skillOffered.description) {
      this.skillOffered.description = this.skillOffered.description.trim();
    }
  }
  
  if (this.skillWanted) {
    this.skillWanted.name = this.skillWanted.name.trim();
    if (this.skillWanted.description) {
      this.skillWanted.description = this.skillWanted.description.trim();
    }
  }
  
  next();
});

// Static method to find requests for a user
swapRequestSchema.statics.findByUser = function(userId, options = {}) {
  const {
    page = 1,
    limit = 10,
    status,
    role = 'all' // 'requester', 'recipient', or 'all'
  } = options;
  
  const skip = (page - 1) * limit;
  
  // Build query
  let query = {
    $or: [
      { requester: userId },
      { recipient: userId }
    ]
  };
  
  // Filter by role
  if (role === 'requester') {
    query = { requester: userId };
  } else if (role === 'recipient') {
    query = { recipient: userId };
  }
  
  // Filter by status
  if (status) {
    query.status = status;
  }
  
  return this.find(query)
    .populate('requester', 'name email avatar rating')
    .populate('recipient', 'name email avatar rating')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

// Static method to find pending requests for a user
swapRequestSchema.statics.findPendingRequests = function(userId, role = 'recipient') {
  const query = {
    status: 'pending'
  };
  
  if (role === 'requester') {
    query.requester = userId;
  } else {
    query.recipient = userId;
  }
  
  return this.find(query)
    .populate('requester', 'name email avatar rating')
    .populate('recipient', 'name email avatar rating')
    .sort({ createdAt: -1 });
};

// Static method to find active swaps
swapRequestSchema.statics.findActiveSwaps = function(userId) {
  return this.find({
    $or: [
      { requester: userId },
      { recipient: userId }
    ],
    status: 'accepted'
  })
  .populate('requester', 'name email avatar rating')
  .populate('recipient', 'name email avatar rating')
  .sort({ scheduledDate: 1 });
};

// Static method to check for duplicate requests
swapRequestSchema.statics.findDuplicateRequest = function(requesterId, recipientId, skillOffered, skillWanted) {
  return this.findOne({
    requester: requesterId,
    recipient: recipientId,
    'skillOffered.name': skillOffered,
    'skillWanted.name': skillWanted,
    status: { $in: ['pending', 'accepted'] }
  });
};

// Instance method to accept request
swapRequestSchema.methods.accept = function() {
  if (this.status !== 'pending') {
    throw new Error('Only pending requests can be accepted');
  }
  
  this.status = 'accepted';
  return this.save();
};

// Instance method to reject request
swapRequestSchema.methods.reject = function(reason = '') {
  if (this.status !== 'pending') {
    throw new Error('Only pending requests can be rejected');
  }
  
  this.status = 'rejected';
  this.rejectedReason = reason;
  return this.save();
};

// Instance method to cancel request
swapRequestSchema.methods.cancel = function() {
  if (!this.canBeCancelled) {
    throw new Error('Only pending requests can be cancelled');
  }
  
  this.status = 'cancelled';
  return this.save();
};

// Instance method to complete request
swapRequestSchema.methods.complete = function() {
  if (!this.canBeCompleted) {
    throw new Error('Only accepted requests can be completed');
  }
  
  this.status = 'completed';
  return this.save();
};

module.exports = mongoose.model('SwapRequest', swapRequestSchema);
