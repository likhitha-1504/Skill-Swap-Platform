# MongoDB Atlas Setup Guide

## 🚀 Quick Start Commands

### 1. Install Dependencies
```bash
cd skill-swap-backend
npm install
```

### 2. Configure Environment Variables
Create `.env` file with your MongoDB Atlas connection string:
```bash
# MongoDB Atlas Configuration
MONGO_URI=mongodb+srv://your_username:your_password@your_cluster.mongodb.net/skill_swap_platform?retryWrites=true&w=majority

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRE=7d

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Logging
LOG_LEVEL=info
```

### 3. Start the Server
```bash
npm start
```

For development:
```bash
npm run dev
```

## 🔗 MongoDB Atlas Connection Steps

### 1. Get Your MongoDB Atlas Connection String

1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Select your cluster
3. Click "Connect" → "Connect your application"
4. Choose "Node.js" and copy the connection string

### 2. Update Your .env File

Replace the placeholder in your `.env` file:
```env
MONGO_URI=mongodb+srv://your_username:your_password@your_cluster.mongodb.net/skill_swap_platform?retryWrites=true&w=majority
```

### 3. Whitelist Your IP Address

In MongoDB Atlas:
1. Go to "Network Access"
2. Click "Add IP Address"
3. Add your current IP or use "0.0.0.0/0" for any IP (development only)

### 4. Create Database User

In MongoDB Atlas:
1. Go to "Database Access"
2. Click "Add New Database User"
3. Enter username and password
4. Give read/write permissions to your database

## 🧪 Test the Connection

### Health Check
```bash
curl http://localhost:5000/health
```

### API Documentation
```bash
curl http://localhost:5000/api
```

### Test Registration
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "Password123",
    "location": "New York",
    "bio": "Full-stack developer",
    "experienceLevel": "intermediate",
    "skillsOffered": [
      {
        "name": "JavaScript",
        "category": "programming",
        "experienceLevel": "advanced"
      }
    ],
    "skillsWanted": [
      {
        "name": "Python",
        "category": "programming"
      }
    ]
  }'
```

### Test Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "Password123"
  }'
```

## 🔧 Common Issues & Solutions

### Issue 1: "Authentication failed" Error
**Problem**: `MongoServerError: bad auth`
**Solution**: 
- Check username and password in connection string
- Ensure database user has correct permissions
- Verify password doesn't contain special characters that need URL encoding

### Issue 2: "IP Whitelist" Error
**Problem**: Connection refused due to IP not whitelisted
**Solution**:
- Add your IP to MongoDB Atlas whitelist
- Or use `0.0.0.0/0` for development (not recommended for production)

### Issue 3: "Network Timeout" Error
**Problem**: Connection times out
**Solution**:
- Check internet connection
- Verify cluster is running
- Try different connection string format

### Issue 4: "Module Not Found" Error
**Problem**: Missing dependencies
**Solution**:
```bash
npm install
```

### Issue 5: "Port Already in Use" Error
**Problem**: Port 5000 is already in use
**Solution**:
```bash
# Find process using port 5000
netstat -ano | findstr :5000

# Kill the process (replace PID)
taskkill /PID <PID> /F

# Or use different port in .env
PORT=5001
```

## 📊 Database Schema

### Users Collection
```javascript
{
  name: String,
  email: String,
  password: String,
  location: String,
  bio: String,
  experienceLevel: String,
  skillsOffered: Array,
  skillsWanted: Array,
  rating: Object,
  totalSwaps: Number,
  completedSwaps: Number,
  isActive: Boolean,
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Swap Requests Collection
```javascript
{
  requester: ObjectId,
  recipient: ObjectId,
  skillOffered: Object,
  skillWanted: Object,
  status: String,
  message: String,
  scheduledDate: Date,
  duration: Number,
  location: String,
  isOnline: Boolean,
  notes: String,
  completedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Messages Collection
```javascript
{
  swapRequest: ObjectId,
  sender: ObjectId,
  receiver: ObjectId,
  content: String,
  messageType: String,
  fileUrl: String,
  isRead: Boolean,
  readAt: Date,
  isEdited: Boolean,
  editedAt: Date,
  deletedAt: Date,
  deletedBy: ObjectId,
  createdAt: Date,
  updatedAt: Date
}
```

### Reviews Collection
```javascript
{
  reviewer: ObjectId,
  reviewee: ObjectId,
  swapRequest: ObjectId,
  rating: Number,
  title: String,
  comment: String,
  skillsExchanged: Array,
  wouldSwapAgain: Boolean,
  communicationRating: Number,
  punctualityRating: Number,
  skillQualityRating: Number,
  isPublic: Boolean,
  isVerified: Boolean,
  helpfulCount: Number,
  response: Object,
  createdAt: Date,
  updatedAt: Date
}
```

## 🚀 Production Deployment

### Environment Variables for Production
```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/skill_swap_platform?retryWrites=true&w=majority
NODE_ENV=production
PORT=5000
JWT_SECRET=your_production_jwt_secret
CORS_ORIGIN=https://yourdomain.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Security Best Practices
- Use strong JWT secret
- Enable IP whitelisting in MongoDB Atlas
- Use environment variables for all sensitive data
- Enable SSL/TLS in production
- Regularly update dependencies
- Monitor database performance

## 📈 Performance Optimization

### MongoDB Indexes
The application automatically creates these indexes:
- Users: email, name, skillsOffered.name, skillsWanted.name
- Swap Requests: requester, recipient, status, createdAt
- Messages: swapRequest, sender, receiver, createdAt
- Reviews: reviewer, reviewee, swapRequest, rating

### Connection Pooling
The database connection uses these settings:
- Max pool size: 10
- Server selection timeout: 5000ms
- Socket timeout: 45000ms

## 🛠️ Development Tools

### MongoDB Compass
Connect using your connection string to visualize data:
1. Download MongoDB Compass
2. Paste your connection string
3. Select the database

### Sample Data Insertion
```bash
node scripts/seedDatabase.js
```

## 📞 Support

If you encounter issues:
1. Check the server logs for detailed error messages
2. Verify MongoDB Atlas cluster status
3. Ensure all environment variables are set correctly
4. Check network connectivity

## ✅ Success Indicators

Your setup is successful when:
- Server starts without errors
- Health check returns 200 OK
- API documentation is accessible
- You can register and login users
- Database collections are created in MongoDB Atlas

Happy coding! 🎉
