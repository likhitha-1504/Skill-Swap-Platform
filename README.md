# Skill Swap Platform - MongoDB Atlas Integration

A modern, production-ready skill exchange platform built with **Node.js, Express.js, and MongoDB Atlas** following clean architecture principles. This platform connects people who want to learn and teach skills through a sophisticated matching and swap system.

## Architecture Overview

This project implements **clean architecture** with the following layers:

```
├── config/          # Database configuration
├── controllers/     # Request/response handling (thin)
├── services/        # Business logic (fat)
├── models/          # Mongoose schemas with validation
├── middleware/      # Validation, error handling, security
├── routes/          # API route definitions
└── server.js        # Application entry point
```

## Key Features

- **MongoDB Atlas Integration**: Production-ready cloud database
- **Clean Architecture**: Separation of concerns with service layer
- **Advanced Validation**: Comprehensive input validation and sanitization
- **Error Handling**: Global error handler with proper HTTP status codes
- **Pagination & Search**: Efficient data retrieval with query parameters
- **Security**: Rate limiting, security headers, input sanitization
- **Skill Matching**: Intelligent algorithm to find compatible users
- **Swap Management**: Complete lifecycle of skill exchange requests
- **User Profiles**: Rich profiles with skills, ratings, and bio
- **Statistics**: Analytics for users and swaps

## Tech Stack

### Backend
- **Node.js** (v14+) with Express.js
- **MongoDB Atlas** (Cloud Database)
- **Mongoose** (ODM with validation)
- **dotenv** (Environment variables)
- **bcrypt** (Password hashing)
- **JWT** (Authentication tokens)
- **express-rate-limit** (Rate limiting)
- **helmet** (Security headers)

### Architecture Pattern
- **Clean Architecture** (Service layer pattern)
- **Repository Pattern** (Data access abstraction)
- **Middleware Pattern** (Request processing pipeline)
- **Error-first Callbacks** (Async error handling)

## Prerequisites

- **Node.js** (v14 or higher)
- **MongoDB Atlas** account (free tier available)
- **npm** (v6 or higher)
- **Git** (for version control)

## Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/likhitha-1504/Skill-Swap-Platform.git
cd Skill-Swap-Platform
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Up MongoDB Atlas

1. **Create MongoDB Atlas Account**
   - Visit [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Sign up for free tier
   - Create a new cluster

2. **Configure Network Access**
   - Go to "Network Access" → "Add IP Address"
   - Allow access from your IP (0.0.0.0/0 for development)

3. **Create Database User**
   - Go to "Database Access" → "Add New Database User"
   - Create user with password

4. **Get Connection String**
   - Go to "Clusters" → "Connect" → "Connect your application"
   - Copy the connection string

### 4. Configure Environment Variables

Create a `.env` file in the root directory:

```env
# MongoDB Atlas Configuration
MONGO_URI=mongodb+srv://your_username:your_password@your_cluster.mongodb.net/skill_swap_platform?retryWrites=true&w=majority

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Configuration (for future authentication)
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
JWT_EXPIRE=7d

# Application Configuration
APP_NAME=Skill Swap Platform
APP_VERSION=1.0.0
```

### 5. Start the Application

**Development Mode:**
```bash
npm run dev
```

**Production Mode:**
```bash
npm start
```

The server will start on `http://localhost:5000`

## API Documentation

### Base URL
```
http://localhost:5000/api
```

### Health Check
```http
GET /health
GET /api
```

### User Management

| Method | Endpoint | Description | Query Parameters |
|--------|----------|-------------|------------------|
| POST | `/api/users` | Create new user | - |
| GET | `/api/users` | Get all users | `page`, `limit`, `search`, `sortBy`, `sortOrder`, `skillOffered`, `skillWanted` |
| GET | `/api/users/:id` | Get user by ID | - |
| PUT | `/api/users/:id` | Update user | - |
| DELETE | `/api/users/:id` | Delete user (soft) | - |
| GET | `/api/users/search` | Search users | `q`, `page`, `limit`, `sortBy`, `sortOrder` |
| GET | `/api/users/statistics` | Get user statistics | - |
| GET | `/api/users/skills/offered/:skill` | Find users by skill offered | `page`, `limit` |
| GET | `/api/users/skills/wanted/:skill` | Find users by skill wanted | `page`, `limit` |

### Swap Management

| Method | Endpoint | Description | Query Parameters |
|--------|----------|-------------|------------------|
| POST | `/api/swaps` | Create swap request | - |
| GET | `/api/swaps` | Get all swaps | `page`, `limit`, `status`, `sortBy`, `sortOrder`, `userId` |
| GET | `/api/swaps/:id` | Get swap by ID | - |
| PUT | `/api/swaps/:id/status` | Update swap status | - |
| DELETE | `/api/swaps/:id` | Delete swap | - |
| GET | `/api/swaps/pending` | Get pending swaps | - |
| GET | `/api/swaps/accepted` | Get accepted swaps | - |
| GET | `/api/swaps/matches` | Find skill matches | - |
| GET | `/api/swaps/statistics` | Get swap statistics | - |
| GET | `/api/swaps/users/:userId` | Get user's swaps | `page`, `limit`, `status`, `role` |

## Testing with Postman

### 1. Import Collection
Create a new Postman collection and import these examples:

### 2. Create User
```http
POST http://localhost:5000/api/users
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "age": 25,
  "course": "Computer Science",
  "skillsOffered": ["JavaScript", "React", "Node.js"],
  "skillsWanted": ["Python", "Machine Learning"],
  "bio": "Full-stack developer passionate about learning new technologies",
  "location": "New York, USA"
}
```

### 3. Create Swap Request
```http
POST http://localhost:5000/api/swaps
Content-Type: application/json

{
  "sender": "USER_ID_HERE",
  "receiver": "RECEIVER_USER_ID_HERE",
  "skillOffered": "JavaScript",
  "skillWanted": "Python",
  "message": "Would love to learn Python in exchange for JavaScript mentoring"
}
```

### 4. Search Users
```http
GET http://localhost:5000/api/users/search?q=javascript&page=1&limit=10
```

### 5. Get Users with Pagination
```http
GET http://localhost:5000/api/users?page=1&limit=5&sortBy=name&sortOrder=asc
```

## Database Schema

### User Model
```javascript
{
  name: String (required, 2-50 chars),
  email: String (required, unique, valid email),
  password: String (required, 6+ chars, hashed),
  age: Number (required, 13-120),
  course: String (required, 2-100 chars),
  skillsOffered: [String] (max 50 chars each),
  skillsWanted: [String] (max 50 chars each),
  bio: String (max 500 chars),
  location: String (max 100 chars),
  rating: Number (0-5, default 0),
  totalRatings: Number (default 0),
  isActive: Boolean (default true),
  avatar: String,
  timestamps: true
}
```

### Swap Model
```javascript
{
  sender: ObjectId (ref: User, required),
  receiver: ObjectId (ref: User, required),
  skillOffered: String (required, 2-50 chars),
  skillWanted: String (required, 2-50 chars),
  status: String (enum: pending/accepted/rejected/cancelled/completed),
  message: String (max 500 chars),
  scheduledDate: Date (future only),
  completedAt: Date,
  rating: {
    senderRating: Number (0-5),
    receiverRating: Number (0-5)
  },
  timestamps: true
}
```

## Configuration Details

### MongoDB Atlas Connection Options
```javascript
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  maxPoolSize: 10,           // Maximum connections
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  family: 4                  // Use IPv4
};
```

### Environment Variables
```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
PORT=5000
NODE_ENV=development
JWT_SECRET=your_secret_key
APP_NAME=Skill Swap Platform
APP_VERSION=1.0.0
```

## Performance & Best Practices

### Database Indexes
- User email (unique)
- User name and skills
- Swap sender/receiver
- Swap status and timestamps

### Error Handling
- Global error handler middleware
- Custom error classes
- Proper HTTP status codes
- Comprehensive logging

### Security Features
- Rate limiting (100 requests/15min)
- Security headers (Helmet.js)
- Input validation and sanitization
- Password hashing with bcrypt
- CORS configuration

### Pagination
- Default: 10 items per page
- Maximum: 100 items per page
- Metadata included in response

## Common Issues & Solutions

### 1. MongoDB Connection Failed
**Error**: `MongoNetworkError`
**Solution**: 
- Check MongoDB Atlas IP whitelist
- Verify connection string format
- Ensure network access is configured

### 2. Validation Errors
**Error**: `ValidationError: 400`
**Solution**: 
- Check request body format
- Validate required fields
- Ensure proper data types

### 3. ObjectId Format Errors
**Error**: `CastError: Cast to ObjectId failed`
**Solution**: 
- Use valid 24-character hex strings
- Check if ID exists in database

### 4. Rate Limiting
**Error**: `429 Too Many Requests`
**Solution**: 
- Wait for rate limit to reset
- Implement exponential backoff
- Use API keys for higher limits

## Deployment

### Environment Setup
```bash
# Production environment variables
NODE_ENV=production
MONGO_URI=your_production_mongodb_uri
JWT_SECRET=your_production_secret
PORT=80
```

### PM2 Deployment
```bash
npm install -g pm2
pm2 start server.js --name "skill-swap-api"
pm2 startup
pm2 save
```

## Monitoring & Logging

### Request Logging
Every request is logged with:
- Method and URL
- Response status
- Duration
- IP address
- User agent

### Error Logging
Comprehensive error logging includes:
- Error stack trace
- Request details
- Timestamp
- Environment context

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Follow clean architecture principles
4. Add tests for new features
5. Commit with descriptive messages
6. Push to branch (`git push origin feature/amazing-feature`)
7. Open Pull Request

## License

This project is licensed under the ISC License.

## Support

- **Issues**: [GitHub Issues](https://github.com/likhitha-1504/Skill-Swap-Platform/issues)
- **Documentation**: Check API endpoints at `/api`
- **Health Check**: Monitor at `/health`

## Future Enhancements

- [ ] JWT Authentication System
- [ ] Real-time notifications (WebSocket)
- [ ] File upload for avatars
- [ ] Advanced search with filters
- [ ] Email notifications
- [ ] Admin dashboard
- [ ] Analytics dashboard
- [ ] Mobile API optimization
- [ ] GraphQL API
- [ ] Microservices architecture