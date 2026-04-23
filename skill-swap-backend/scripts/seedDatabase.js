require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const SwapRequest = require('../models/SwapRequest');
const Message = require('../models/Message');
const Review = require('../models/Review');

/**
 * Database Seeding Script
 * Populates the database with sample data for testing
 */

// Sample users data
const sampleUsers = [
  {
    name: 'Alice Johnson',
    email: 'alice@example.com',
    password: 'Password123',
    location: 'New York, USA',
    bio: 'Full-stack developer with 5 years of experience in React and Node.js. Passionate about teaching and learning new technologies.',
    experienceLevel: 'advanced',
    skillsOffered: [
      { name: 'JavaScript', category: 'programming', experienceLevel: 'expert', description: 'Advanced JS concepts, ES6+, async programming' },
      { name: 'React', category: 'programming', experienceLevel: 'expert', description: 'Hooks, Redux, Next.js, performance optimization' },
      { name: 'Node.js', category: 'programming', experienceLevel: 'advanced', description: 'Express, REST APIs, microservices' }
    ],
    skillsWanted: [
      { name: 'Python', category: 'programming', description: 'Data science and machine learning' },
      { name: 'Docker', category: 'programming', description: 'Containerization and DevOps' }
    ],
    availability: 'available'
  },
  {
    name: 'Bob Smith',
    email: 'bob@example.com',
    password: 'Password123',
    location: 'San Francisco, USA',
    bio: 'Data scientist specializing in machine learning and AI. Love to share knowledge about Python, TensorFlow, and data visualization.',
    experienceLevel: 'expert',
    skillsOffered: [
      { name: 'Python', category: 'programming', experienceLevel: 'expert', description: 'Data analysis, machine learning, automation' },
      { name: 'Machine Learning', category: 'programming', experienceLevel: 'expert', description: 'TensorFlow, scikit-learn, deep learning' },
      { name: 'Data Visualization', category: 'programming', experienceLevel: 'advanced', description: 'Matplotlib, Seaborn, Plotly, D3.js' }
    ],
    skillsWanted: [
      { name: 'JavaScript', category: 'programming', description: 'Frontend development for ML dashboards' },
      { name: 'Cloud Computing', category: 'programming', description: 'AWS, GCP for ML deployment' }
    ],
    availability: 'available'
  },
  {
    name: 'Carol Davis',
    email: 'carol@example.com',
    password: 'Password123',
    location: 'London, UK',
    bio: 'UX/UI designer with a passion for creating intuitive and beautiful user experiences. Specialize in mobile app design and design systems.',
    experienceLevel: 'advanced',
    skillsOffered: [
      { name: 'UI Design', category: 'design', experienceLevel: 'expert', description: 'Mobile app design, web design, design systems' },
      { name: 'UX Research', category: 'design', experienceLevel: 'advanced', description: 'User research, usability testing, personas' },
      { name: 'Figma', category: 'design', experienceLevel: 'expert', description: 'Prototyping, design systems, collaboration' }
    ],
    skillsWanted: [
      { name: 'Frontend Development', category: 'programming', description: 'HTML, CSS, JavaScript to implement designs' },
      { name: 'Marketing', category: 'marketing', description: 'Digital marketing for design products' }
    ],
    availability: 'busy'
  },
  {
    name: 'David Wilson',
    email: 'david@example.com',
    password: 'Password123',
    location: 'Toronto, Canada',
    bio: 'Digital marketing specialist with expertise in SEO, content marketing, and social media strategy. Help businesses grow their online presence.',
    experienceLevel: 'intermediate',
    skillsOffered: [
      { name: 'SEO', category: 'marketing', experienceLevel: 'advanced', description: 'Technical SEO, content optimization, link building' },
      { name: 'Content Marketing', category: 'marketing', experienceLevel: 'advanced', description: 'Content strategy, blog writing, email marketing' },
      { name: 'Social Media', category: 'marketing', experienceLevel: 'intermediate', description: 'Facebook, Instagram, LinkedIn strategy' }
    ],
    skillsWanted: [
      { name: 'Graphic Design', category: 'design', description: 'Create visual content for marketing campaigns' },
      { name: 'Video Editing', category: 'other', description: 'Create promotional videos and tutorials' }
    ],
    availability: 'available'
  },
  {
    name: 'Emma Brown',
    email: 'emma@example.com',
    password: 'Password123',
    location: 'Sydney, Australia',
    bio: 'Professional writer and editor with experience in technical writing, content creation, and copywriting. Love helping others improve their writing skills.',
    experienceLevel: 'advanced',
    skillsOffered: [
      { name: 'Technical Writing', category: 'writing', experienceLevel: 'expert', description: 'Documentation, API docs, tutorials' },
      { name: 'Content Writing', category: 'writing', experienceLevel: 'expert', description: 'Blog posts, articles, web content' },
      { name: 'Copywriting', category: 'writing', experienceLevel: 'advanced', description: 'Marketing copy, product descriptions, ads' }
    ],
    skillsWanted: [
      { name: 'Programming', category: 'programming', description: 'Learn to write technical documentation for software' },
      { name: 'Photography', category: 'other', description: 'Visual storytelling for written content' }
    ],
    availability: 'available'
  }
];

// Sample swap requests
const sampleSwapRequests = [
  {
    skillOffered: {
      name: 'JavaScript',
      category: 'programming',
      experienceLevel: 'expert',
      description: 'Advanced JS concepts, ES6+, async programming'
    },
    skillWanted: {
      name: 'Python',
      category: 'programming',
      description: 'Data science and machine learning'
    },
    message: 'I would love to learn Python for data science in exchange for JavaScript mentoring. I have extensive experience in frontend development and can help with React, Node.js, and advanced JavaScript concepts.',
    scheduledDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    duration: 90,
    location: 'Online - Google Meet',
    isOnline: true,
    notes: 'Looking for someone who can explain ML concepts clearly.'
  },
  {
    skillOffered: {
      name: 'Python',
      category: 'programming',
      experienceLevel: 'expert',
      description: 'Data analysis, machine learning, automation'
    },
    skillWanted: {
      name: 'JavaScript',
      category: 'programming',
      description: 'Frontend development for ML dashboards'
    },
    message: 'I can teach Python for data science and machine learning. Would love to learn JavaScript to create better web interfaces for my ML projects.',
    scheduledDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    duration: 60,
    location: 'Online - Zoom',
    isOnline: true,
    notes: 'Can provide real datasets for practice.'
  }
];

// Sample messages
const sampleMessages = [
  {
    content: 'Hi! I saw your profile and I\'m really interested in learning Python. Your experience in machine learning is exactly what I\'m looking for!',
    messageType: 'text'
  },
  {
    content: 'Hello! I\'d be happy to help you learn Python. What specific areas are you most interested in?',
    messageType: 'text'
  },
  {
    content: 'Mostly data science and ML. I want to understand how to build predictive models and work with datasets.',
    messageType: 'text'
  },
  {
    content: 'Perfect! I can definitely help with that. Do you have any specific projects in mind?',
    messageType: 'text'
  }
];

// Sample reviews
const sampleReviews = [
  {
    rating: 5,
    title: 'Excellent JavaScript mentor!',
    comment: 'Alice is an amazing teacher. She explained complex JavaScript concepts in a way that was easy to understand. Her practical examples were very helpful.',
    skillsExchanged: [
      { offered: 'JavaScript', wanted: 'Python' }
    ],
    wouldSwapAgain: true,
    communicationRating: 5,
    punctualityRating: 5,
    skillQualityRating: 5
  },
  {
    rating: 4,
    title: 'Great Python teacher',
    comment: 'Bob has deep knowledge of Python and machine learning. The sessions were very informative. Only minor issue was sometimes going too fast.',
    skillsExchanged: [
      { offered: 'Python', wanted: 'JavaScript' }
    ],
    wouldSwapAgain: true,
    communicationRating: 4,
    punctualityRating: 5,
    skillQualityRating: 4
  }
];

/**
 * Seed the database with sample data
 */
const seedDatabase = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await SwapRequest.deleteMany({});
    await Message.deleteMany({});
    await Review.deleteMany({});
    console.log('✅ Cleared existing data');

    // Create users
    console.log('👥 Creating users...');
    const createdUsers = [];
    
    for (const userData of sampleUsers) {
      // Hash password
      const salt = await bcrypt.genSalt(12);
      userData.password = await bcrypt.hash(userData.password, salt);
      
      const user = await User.create(userData);
      createdUsers.push(user);
      console.log(`✅ Created user: ${user.name}`);
    }

    // Create swap requests
    console.log('📝 Creating swap requests...');
    const createdRequests = [];
    
    for (let i = 0; i < sampleSwapRequests.length; i++) {
      const requestData = sampleSwapRequests[i];
      const requester = createdUsers[i];
      const recipient = createdUsers[(i + 1) % createdUsers.length];
      
      const swapRequest = await SwapRequest.create({
        requester: requester._id,
        recipient: recipient._id,
        ...requestData,
        status: 'accepted' // Set to accepted for testing
      });
      
      createdRequests.push(swapRequest);
      console.log(`✅ Created swap request: ${requester.name} → ${recipient.name}`);
      
      // Update user swap counts
      await User.findByIdAndUpdate(requester._id, {
        $inc: { totalSwaps: 1, completedSwaps: 1 }
      });
      
      await User.findByIdAndUpdate(recipient._id, {
        $inc: { totalSwaps: 1, completedSwaps: 1 }
      });
    }

    // Create messages
    console.log('💬 Creating messages...');
    for (let i = 0; i < createdRequests.length; i++) {
      const swapRequest = createdRequests[i];
      
      for (let j = 0; j < sampleMessages.length; j++) {
        const messageData = sampleMessages[j];
        const sender = j % 2 === 0 ? swapRequest.requester : swapRequest.recipient;
        const receiver = j % 2 === 0 ? swapRequest.recipient : swapRequest.requester;
        
        await Message.create({
          swapRequest: swapRequest._id,
          sender,
          receiver,
          ...messageData
        });
      }
      
      console.log(`✅ Created messages for request ${i + 1}`);
    }

    // Create reviews
    console.log('⭐ Creating reviews...');
    for (let i = 0; i < createdRequests.length; i++) {
      const swapRequest = createdRequests[i];
      const reviewData = sampleReviews[i];
      
      await Review.create({
        reviewer: swapRequest.recipient,
        reviewee: swapRequest.requester,
        swapRequest: swapRequest._id,
        ...reviewData
      });
      
      console.log(`✅ Created review for ${createdUsers[i].name}`);
    }

    // Update user ratings
    console.log('📊 Updating user ratings...');
    for (const user of createdUsers) {
      const reviews = await Review.find({ reviewee: user._id });
      if (reviews.length > 0) {
        const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
        const averageRating = totalRating / reviews.length;
        
        await User.findByIdAndUpdate(user._id, {
          'rating.average': averageRating,
          'rating.count': reviews.length
        });
      }
    }

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📊 Summary:');
    console.log(`- Users: ${createdUsers.length}`);
    console.log(`- Swap Requests: ${createdRequests.length}`);
    console.log(`- Messages: ${sampleMessages.length * createdRequests.length}`);
    console.log(`- Reviews: ${sampleReviews.length}`);
    
    console.log('\n🔑 Test Accounts:');
    createdUsers.forEach(user => {
      console.log(`- ${user.name}: ${user.email} / Password123`);
    });

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    // Close connection
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
};

// Run the seeding script
if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
