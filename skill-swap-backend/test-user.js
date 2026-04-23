const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import User model
const User = require('./models/User');

// Test user data
const testUser = {
  name: 'Demo User',
  email: 'demo@example.com',
  password: 'password123',
  location: 'New York',
  bio: 'Demo user for testing the SkillSwap platform',
  experienceLevel: 'intermediate',
  skillsOffered: [
    { name: 'JavaScript', category: 'programming', experienceLevel: 'advanced' },
    { name: 'React', category: 'programming', experienceLevel: 'advanced' },
    { name: 'Node.js', category: 'programming', experienceLevel: 'intermediate' }
  ],
  skillsWanted: [
    { name: 'Python', category: 'programming' },
    { name: 'UI Design', category: 'design' }
  ]
};

const createTestUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Check if user already exists
    const existingUser = await User.findOne({ email: testUser.email });
    if (existingUser) {
      console.log('Test user already exists');
      await mongoose.connection.close();
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(testUser.password, salt);

    // Create user
    const user = new User({
      ...testUser,
      password: hashedPassword
    });

    await user.save();
    console.log('Test user created successfully');
    console.log('Email: demo@example.com');
    console.log('Password: password123');

  } catch (error) {
    console.error('Error creating test user:', error);
  } finally {
    await mongoose.connection.close();
  }
};

createTestUser();
