require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const path = require('path');

// Import database connection
const connectDB = require('./config/database');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const skillRoutes = require('./routes/skills');
const requestRoutes = require('./routes/requests');
const messageRoutes = require('./routes/messages');
const reviewRoutes = require('./routes/reviews');

/**
 * Skill Swap Platform Server
 * Main application entry point with MongoDB Atlas integration
 */

// Create Express app
const app = express();

// Trust proxy for rate limiting
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // In development, allow all origins
    if (process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    
    // In production, allow specific origins
    const allowedOrigins = process.env.CORS_ORIGIN ? 
      process.env.CORS_ORIGIN.split(',') : 
      ['http://localhost:3000'];
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Skill Swap Platform API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  });
});

// API documentation endpoint
app.get('/api', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Skill Swap Platform API',
    version: '1.0.0',
    documentation: {
      auth: {
        'POST /api/auth/register': 'Register a new user',
        'POST /api/auth/login': 'Login user',
        'GET /api/auth/profile': 'Get current user profile',
        'PUT /api/auth/profile': 'Update user profile',
        'PUT /api/auth/change-password': 'Change password'
      },
      users: {
        'GET /api/users': 'Get all users with pagination',
        'GET /api/users/:id': 'Get user by ID',
        'PUT /api/users/:id': 'Update user',
        'DELETE /api/users/:id': 'Delete user',
        'GET /api/users/search': 'Search users',
        'GET /api/users/:id/stats': 'Get user statistics',
        'GET /api/users/:id/matches': 'Get skill matches'
      },
      skills: {
        'GET /api/skills': 'Get all skills',
        'POST /api/skills': 'Add skill to profile',
        'GET /api/skills/categories': 'Get skill categories',
        'GET /api/skills/search': 'Search skills',
        'GET /api/skills/popular': 'Get popular skills'
      },
      requests: {
        'GET /api/requests': 'Get swap requests',
        'POST /api/requests': 'Create swap request',
        'GET /api/requests/:id': 'Get request by ID',
        'PUT /api/requests/:id/accept': 'Accept request',
        'PUT /api/requests/:id/reject': 'Reject request',
        'PUT /api/requests/:id/cancel': 'Cancel request',
        'PUT /api/requests/:id/complete': 'Complete request'
      },
      messages: {
        'GET /api/messages/conversations': 'Get conversations',
        'GET /api/messages/conversation/:id': 'Get messages',
        'POST /api/messages': 'Send message',
        'PUT /api/messages/conversation/:id/read': 'Mark as read'
      },
      reviews: {
        'GET /api/reviews/user/:id': 'Get user reviews',
        'POST /api/reviews': 'Create review',
        'GET /api/reviews/user/:id/rating': 'Get user rating'
      }
    },
    examples: {
      register: {
        method: 'POST',
        url: '/api/auth/register',
        body: {
          name: 'John Doe',
          email: 'john@example.com',
          password: 'password123',
          location: 'New York',
          bio: 'Full-stack developer passionate about learning',
          experienceLevel: 'intermediate',
          skillsOffered: [
            { name: 'JavaScript', category: 'programming', experienceLevel: 'advanced' }
          ],
          skillsWanted: [
            { name: 'Python', category: 'programming' }
          ]
        }
      },
      login: {
        method: 'POST',
        url: '/api/auth/login',
        body: {
          email: 'john@example.com',
          password: 'password123'
        }
      },
      createRequest: {
        method: 'POST',
        url: '/api/requests',
        body: {
          recipient: '60f7b3b3b3b3b3b3b3b3b3b3',
          skillOffered: {
            name: 'JavaScript',
            category: 'programming',
            experienceLevel: 'advanced'
          },
          skillWanted: {
            name: 'Python',
            category: 'programming'
          },
          message: 'Would love to learn Python in exchange for JavaScript mentoring'
        }
      }
    }
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/reviews', reviewRoutes);

// 404 handler for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`,
    availableRoutes: [
      '/api/auth',
      '/api/users',
      '/api/skills',
      '/api/requests',
      '/api/messages',
      '/api/reviews'
    ]
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      message: errors.join(', ')
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      success: false,
      error: 'Duplicate Field',
      message: `${field} already exists`
    });
  }

  // Mongoose cast error
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      error: 'Invalid ID',
      message: 'Invalid resource ID format'
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: 'Invalid Token',
      message: 'Invalid authentication token'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: 'Token Expired',
      message: 'Authentication token has expired'
    });
  }

  // Default error
  res.status(err.statusCode || 500).json({
    success: false,
    error: err.name || 'Internal Server Error',
    message: err.message || 'Something went wrong on the server',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

/**
 * Start server and connect to database
 */
const startServer = async () => {
  try {
    // Connect to MongoDB Atlas
    console.log('🔄 Connecting to MongoDB Atlas...');
    await connectDB();
    
    // Start server
    const PORT = process.env.PORT || 5000;
    const server = app.listen(PORT, () => {
      console.log(`🚀 Skill Swap Platform API running on port ${PORT}`);
      console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📚 API Documentation: http://localhost:${PORT}/api`);
      console.log(`💚 Health Check: http://localhost:${PORT}/health`);
      console.log(`🌐 CORS Origin: ${process.env.CORS_ORIGIN || 'http://localhost:3000'}`);
    });

    // Graceful shutdown
    const gracefulShutdown = (signal) => {
      console.log(`\n🔄 Received ${signal}. Shutting down gracefully...`);
      
      server.close(() => {
        console.log('✅ HTTP server closed');
        
        // Close MongoDB connection
        const mongoose = require('mongoose');
        mongoose.connection.close(() => {
          console.log('✅ MongoDB connection closed');
          process.exit(0);
        });
      });
    };

    // Handle process termination
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Handle uncaught exceptions
    process.on('uncaughtException', (err) => {
      console.error('❌ Uncaught Exception:', err);
      process.exit(1);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
      process.exit(1);
    });

    return server;
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
if (require.main === module) {
  startServer();
}

module.exports = app;
