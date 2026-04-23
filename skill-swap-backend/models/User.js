const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * User Schema
 * Represents a user in the Skill Swap Platform
 */
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters long'],
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email address'
    ]
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false // Don't include password in queries by default
  },
  avatar: {
    type: String,
    default: null
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot exceed 500 characters'],
    trim: true,
    default: ''
  },
  location: {
    type: String,
    maxlength: [100, 'Location cannot exceed 100 characters'],
    trim: true,
    default: ''
  },
  experienceLevel: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'expert'],
    default: 'intermediate'
  },
  availability: {
    type: String,
    enum: ['available', 'busy', 'unavailable'],
    default: 'available'
  },
  skillsOffered: [{
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: [50, 'Skill name cannot exceed 50 characters']
    },
    category: {
      type: String,
      required: true,
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
    experienceLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'expert'],
      default: 'intermediate'
    },
    description: {
      type: String,
      maxlength: [200, 'Description cannot exceed 200 characters'],
      trim: true,
      default: ''
    }
  }],
  skillsWanted: [{
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: [50, 'Skill name cannot exceed 50 characters']
    },
    category: {
      type: String,
      required: true,
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
  }],
  rating: {
    average: {
      type: Number,
      default: 0,
      min: [0, 'Rating cannot be less than 0'],
      max: [5, 'Rating cannot exceed 5']
    },
    count: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  totalSwaps: {
    type: Number,
    default: 0,
    min: 0
  },
  completedSwaps: {
    type: Number,
    default: 0,
    min: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
userSchema.index({ email: 1 });
userSchema.index({ name: 1 });
userSchema.index({ 'skillsOffered.name': 1 });
userSchema.index({ 'skillsWanted.name': 1 });
userSchema.index({ 'skillsOffered.category': 1 });
userSchema.index({ 'skillsWanted.category': 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ createdAt: -1 });

// Virtual for user's full profile completion percentage
userSchema.virtual('profileCompletion').get(function() {
  let completed = 0;
  let total = 7; // name, email, password (not counted), bio, location, avatar, skillsOffered, skillsWanted
  
  if (this.bio && this.bio.length > 0) completed++;
  if (this.location && this.location.length > 0) completed++;
  if (this.avatar) completed++;
  if (this.skillsOffered && this.skillsOffered.length > 0) completed++;
  if (this.skillsWanted && this.skillsWanted.length > 0) completed++;
  
  return Math.round((completed / total) * 100);
});

// Virtual for average rating display
userSchema.virtual('displayRating').get(function() {
  return this.rating.count > 0 ? this.rating.average.toFixed(1) : 'No ratings yet';
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();
  
  try {
    // Hash password with cost of 12
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Pre-save middleware to clean data
userSchema.pre('save', function(next) {
  // Ensure email is lowercase
  if (this.email) {
    this.email = this.email.toLowerCase();
  }
  
  // Trim string fields
  const stringFields = ['name', 'bio', 'location'];
  stringFields.forEach(field => {
    if (this[field]) {
      this[field] = this[field].trim();
    }
  });
  
  // Clean skills arrays
  if (this.skillsOffered) {
    this.skillsOffered = this.skillsOffered
      .map(skill => ({
        ...skill,
        name: skill.name.trim(),
        description: skill.description ? skill.description.trim() : ''
      }))
      .filter(skill => skill.name.length > 0);
  }
  
  if (this.skillsWanted) {
    this.skillsWanted = this.skillsWanted
      .map(skill => ({
        ...skill,
        name: skill.name.trim(),
        description: skill.description ? skill.description.trim() : ''
      }))
      .filter(skill => skill.name.length > 0);
  }
  
  next();
});

// Instance method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// Instance method to update rating
userSchema.methods.updateRating = function(newRating) {
  const currentTotal = this.rating.average * this.rating.count;
  this.rating.count += 1;
  this.rating.average = (currentTotal + newRating) / this.rating.count;
  return this.save();
};

// Instance method to increment swap counters
userSchema.methods.incrementSwapCount = function(status) {
  this.totalSwaps += 1;
  if (status === 'completed') {
    this.completedSwaps += 1;
  }
  return this.save();
};

// Static method to find users by skill offered
userSchema.statics.findBySkillOffered = function(skillName, category = null) {
  const query = {
    isActive: true,
    'skillsOffered.name': { $regex: new RegExp(skillName, 'i') }
  };
  
  if (category) {
    query['skillsOffered.category'] = category;
  }
  
  return this.find(query)
    .select('-password')
    .sort({ 'rating.average': -1, createdAt: -1 });
};

// Static method to find users by skill wanted
userSchema.statics.findBySkillWanted = function(skillName, category = null) {
  const query = {
    isActive: true,
    'skillsWanted.name': { $regex: new RegExp(skillName, 'i') }
  };
  
  if (category) {
    query['skillsWanted.category'] = category;
  }
  
  return this.find(query)
    .select('-password')
    .sort({ 'rating.average': -1, createdAt: -1 });
};

// Static method to find potential matches for a user
userSchema.statics.findSkillMatches = function(userId, limit = 10) {
  return this.findById(userId).then(user => {
    if (!user) throw new Error('User not found');
    
    // Find users who offer skills that current user wants
    const wantedSkills = user.skillsWanted.map(skill => skill.name);
    
    return this.find({
      _id: { $ne: userId },
      isActive: true,
      'skillsOffered.name': { $in: wantedSkills }
    })
    .select('-password')
    .sort({ 'rating.average': -1, createdAt: -1 })
    .limit(limit);
  });
};

// Static method for advanced user search
userSchema.statics.searchUsers = function(query, options = {}) {
  const {
    page = 1,
    limit = 10,
    sortBy = 'createdAt',
    sortOrder = -1,
    skillCategory,
    experienceLevel,
    availability
  } = options;
  
  const skip = (page - 1) * limit;
  
  // Build search query
  const searchQuery = {
    isActive: true,
    $or: [
      { name: { $regex: query, $options: 'i' } },
      { bio: { $regex: query, $options: 'i' } },
      { location: { $regex: query, $options: 'i' } },
      { 'skillsOffered.name': { $regex: query, $options: 'i' } },
      { 'skillsWanted.name': { $regex: query, $options: 'i' } }
    ]
  };
  
  // Add filters
  if (skillCategory) {
    searchQuery.$or = [
      ...searchQuery.$or,
      { 'skillsOffered.category': skillCategory },
      { 'skillsWanted.category': skillCategory }
    ];
  }
  
  if (experienceLevel) {
    searchQuery.experienceLevel = experienceLevel;
  }
  
  if (availability) {
    searchQuery.availability = availability;
  }
  
  return this.find(searchQuery)
    .select('-password')
    .sort({ [sortBy]: sortOrder })
    .skip(skip)
    .limit(limit);
};

module.exports = mongoose.model('User', userSchema);
