import axios from 'axios';

/**
 * API Service Configuration
 * Centralized API configuration and request interceptors
 */

// Base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized - token expired or invalid
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      // Redirect to login page
      window.location.href = '/login';
    }
    
    // Handle 403 Forbidden - insufficient permissions
    if (error.response?.status === 403) {
      console.error('Access forbidden:', error.response.data.message);
    }
    
    // Handle 500 Server Error
    if (error.response?.status === 500) {
      console.error('Server error:', error.response.data.message);
    }
    
    return Promise.reject(error);
  }
);

/**
 * Authentication API
 */
export const authAPI = {
  // Login user
  login: (credentials) => api.post('/auth/login', credentials),
  
  // Register user
  register: (userData) => api.post('/auth/register', userData),
  
  // Get current user profile
  getProfile: () => api.get('/auth/profile'),
  
  // Update profile
  updateProfile: (userData) => api.put('/auth/profile', userData),
  
  // Change password
  changePassword: (passwordData) => api.put('/auth/change-password', passwordData),
};

/**
 * Users API
 */
export const usersAPI = {
  // Get all users with pagination and filters
  getUsers: (params) => api.get('/users', { params }),
  
  // Get user by ID
  getUserById: (id) => api.get(`/users/${id}`),
  
  // Update user
  updateUser: (id, userData) => api.put(`/users/${id}`, userData),
  
  // Delete user
  deleteUser: (id) => api.delete(`/users/${id}`),
  
  // Search users
  searchUsers: (query, params) => api.get('/users/search', { params: { q: query, ...params } }),
  
  // Get user statistics
  getUserStats: (id) => api.get(`/users/${id}/stats`),
  
  // Find skill matches for user
  getSkillMatches: (id, params) => api.get(`/users/${id}/matches`, { params }),
  
  // Upload avatar
  uploadAvatar: (id, formData) => api.post(`/users/${id}/avatar`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
};

/**
 * Skills API
 */
export const skillsAPI = {
  // Get all skills with pagination and filters
  getSkills: (params) => api.get('/skills', { params }),
  
  // Get skill categories
  getCategories: () => api.get('/skills/categories'),
  
  // Get skills by category
  getSkillsByCategory: (category, params) => api.get(`/skills/category/${category}`, { params }),
  
  // Search skills
  searchSkills: (query, params) => api.get('/skills/search', { params: { q: query, ...params } }),
  
  // Get popular skills
  getPopularSkills: (params) => api.get('/skills/popular', { params }),
  
  // Add skill to user profile
  addSkill: (skillData) => api.post('/skills', skillData),
  
  // Update skill
  updateSkill: (id, skillData) => api.put(`/skills/${id}`, skillData),
  
  // Remove skill
  removeSkill: (id) => api.delete(`/skills/${id}`),
};

/**
 * Swap Requests API
 */
export const swapRequestsAPI = {
  // Get all swap requests for a user
  getSwapRequests: (params) => api.get('/requests', { params }),
  
  // Get swap request by ID
  getSwapRequestById: (id) => api.get(`/requests/${id}`),
  
  // Create swap request
  createSwapRequest: (requestData) => api.post('/requests', requestData),
  
  // Update swap request
  updateSwapRequest: (id, requestData) => api.put(`/requests/${id}`, requestData),
  
  // Accept swap request
  acceptRequest: (id) => api.put(`/requests/${id}/accept`),
  
  // Reject swap request
  rejectRequest: (id, reason) => api.put(`/requests/${id}/reject`, { reason }),
  
  // Cancel swap request
  cancelRequest: (id) => api.put(`/requests/${id}/cancel`),
  
  // Complete swap request
  completeRequest: (id) => api.put(`/requests/${id}/complete`),
  
  // Get pending requests
  getPendingRequests: (params) => api.get('/requests/pending', { params }),
  
  // Get active swaps
  getActiveSwaps: (params) => api.get('/requests/active', { params }),
  
  // Get completed swaps
  getCompletedSwaps: (params) => api.get('/requests/completed', { params }),
};

/**
 * Messages API
 */
export const messagesAPI = {
  // Get conversations for a user
  getConversations: (params) => api.get('/messages/conversations', { params }),
  
  // Get messages in a conversation
  getMessages: (swapRequestId, params) => api.get(`/messages/conversation/${swapRequestId}`, { params }),
  
  // Send message
  sendMessage: (messageData) => api.post('/messages', messageData),
  
  // Mark messages as read
  markAsRead: (swapRequestId) => api.put(`/messages/conversation/${swapRequestId}/read`),
  
  // Get unread message count
  getUnreadCount: () => api.get('/messages/unread-count'),
  
  // Delete message
  deleteMessage: (id) => api.delete(`/messages/${id}`),
};

/**
 * Reviews API
 */
export const reviewsAPI = {
  // Get reviews for a user
  getReviews: (userId, params) => api.get(`/reviews/user/${userId}`, { params }),
  
  // Create review
  createReview: (reviewData) => api.post('/reviews', reviewData),
  
  // Update review
  updateReview: (id, reviewData) => api.put(`/reviews/${id}`, reviewData),
  
  // Delete review
  deleteReview: (id) => api.delete(`/reviews/${id}`),
  
  // Get user's average rating
  getUserRating: (userId) => api.get(`/reviews/user/${userId}/rating`),
  
  // Get reviews given by user
  getGivenReviews: (userId, params) => api.get(`/reviews/given/${userId}`, { params }),
  
  // Get reviews received by user
  getReceivedReviews: (userId, params) => api.get(`/reviews/received/${userId}`, { params }),
};

/**
 * Notifications API
 */
export const notificationsAPI = {
  // Get user notifications
  getNotifications: (params) => api.get('/notifications', { params }),
  
  // Mark notification as read
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  
  // Mark all notifications as read
  markAllAsRead: () => api.put('/notifications/read-all'),
  
  // Delete notification
  deleteNotification: (id) => api.delete(`/notifications/${id}`),
  
  // Get notification settings
  getNotificationSettings: () => api.get('/notifications/settings'),
  
  // Update notification settings
  updateNotificationSettings: (settings) => api.put('/notifications/settings', settings),
};

/**
 * Utility functions
 */
export const utils = {
  // Cancel all pending requests
  cancelAllRequests: () => {
    // Cancel all axios requests
    api.CancelToken = axios.CancelToken;
    api.source = api.CancelToken.source();
    api.cancel = api.source.cancel;
  },
  
  // Set default headers
  setDefaultHeader: (key, value) => {
    api.defaults.headers.common[key] = value;
  },
  
  // Remove default header
  removeDefaultHeader: (key) => {
    delete api.defaults.headers.common[key];
  },
};

// Export the main api instance
export default api;
