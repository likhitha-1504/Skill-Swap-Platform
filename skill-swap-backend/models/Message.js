const mongoose = require('mongoose');

/**
 * Message Schema
 * Represents a message between users in a swap request conversation
 */
const messageSchema = new mongoose.Schema({
  swapRequest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SwapRequest',
    required: [true, 'Swap request is required']
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Sender is required']
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Receiver is required']
  },
  content: {
    type: String,
    required: [true, 'Message content is required'],
    trim: true,
    maxlength: [1000, 'Message cannot exceed 1000 characters']
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'file', 'system'],
    default: 'text'
  },
  fileUrl: {
    type: String,
    default: null
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date,
    default: null
  },
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: {
    type: Date,
    default: null
  },
  deletedAt: {
    type: Date,
    default: null
  },
  deletedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
messageSchema.index({ swapRequest: 1 });
messageSchema.index({ sender: 1 });
messageSchema.index({ receiver: 1 });
messageSchema.index({ createdAt: -1 });
messageSchema.index({ isRead: 1 });

// Compound indexes
messageSchema.index({ swapRequest: 1, createdAt: -1 });
messageSchema.index({ sender: 1, receiver: 1 });
messageSchema.index({ swapRequest: 1, isRead: 1 });

// Virtual for checking if message can be edited
messageSchema.virtual('canBeEdited').get(function() {
  // Messages can be edited within 15 minutes of creation and if not read
  const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
  return this.createdAt > fifteenMinutesAgo && !this.isRead && !this.deletedAt;
});

// Virtual for message status
messageSchema.virtual('status').get(function() {
  if (this.deletedAt) return 'deleted';
  if (this.isRead) return 'read';
  if (this.isEdited) return 'edited';
  return 'sent';
});

// Pre-save middleware
messageSchema.pre('save', function(next) {
  // Prevent self-messaging
  if (this.sender.toString() === this.receiver.toString()) {
    const error = new Error('Cannot send message to yourself');
    return next(error);
  }
  
  // Set timestamps
  const now = new Date();
  
  if (this.isModified('isRead') && this.isRead && !this.readAt) {
    this.readAt = now;
  }
  
  if (this.isModified('content') && this.isNew === false && !this.isEdited) {
    this.isEdited = true;
    this.editedAt = now;
  }
  
  // Trim content
  if (this.content) {
    this.content = this.content.trim();
  }
  
  next();
});

// Static method to get conversation messages
messageSchema.statics.getConversation = async (swapRequestId, options = {}) => {
  const {
    page = 1,
    limit = 50,
    before = null,
    after = null
  } = options;
  
  const skip = (page - 1) * limit;
  
  // Build query
  const query = { swapRequest: swapRequestId, deletedAt: null };
  
  // Add time-based filtering
  if (before) {
    query.createdAt = { $lt: new Date(before) };
  } else if (after) {
    query.createdAt = { $gt: new Date(after) };
  }
  
  return this.find(query)
    .populate('sender', 'name avatar')
    .populate('receiver', 'name avatar')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

// Static method to get unread message count
messageSchema.statics.getUnreadCount = async (userId) => {
  return this.countDocuments({
    receiver: userId,
    isRead: false,
    deletedAt: null
  });
};

// Static method to mark messages as read
messageSchema.statics.markAsRead = async (swapRequestId, userId) => {
  return this.updateMany(
    {
      swapRequest: swapRequestId,
      receiver: userId,
      isRead: false,
      deletedAt: null
    },
    {
      isRead: true,
      readAt: new Date()
    }
  );
};

// Static method to delete message (soft delete)
messageSchema.statics.deleteMessage = async (messageId, userId) => {
  return this.findByIdAndUpdate(
    messageId,
    {
      deletedAt: new Date(),
      deletedBy: userId
    },
    { new: true }
  );
};

// Instance method to mark as read
messageSchema.methods.markAsRead = function() {
  this.isRead = true;
  this.readAt = new Date();
  return this.save();
};

// Instance method to edit message
messageSchema.methods.editMessage = function(newContent) {
  if (!this.canBeEdited) {
    throw new Error('Message cannot be edited');
  }
  
  this.content = newContent.trim();
  this.isEdited = true;
  this.editedAt = new Date();
  
  return this.save();
};

// Instance method to soft delete
messageSchema.methods.softDelete = function(userId) {
  this.deletedAt = new Date();
  this.deletedBy = userId;
  
  return this.save();
};

module.exports = mongoose.model('Message', messageSchema);
