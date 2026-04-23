import React from 'react';
import { Link } from 'react-router-dom';
import {
  StarIcon,
  MapPinIcon,
  AcademicCapIcon,
  UserIcon,
  ChatBubbleLeftRightIcon,
  EnvelopeIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';

/**
 * UserCard Component
 * Displays user information with skills and actions
 */
const UserCard = ({ 
  user, 
  showActions = true, 
  compact = false, 
  className = '' 
}) => {
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<StarSolid key={i} className="w-4 h-4 star-filled" />);
      } else {
        stars.push(<StarIcon key={i} className="w-4 h-4 star-empty" />);
      }
    }
    
    return stars;
  };

  const getAvailabilityColor = (availability) => {
    switch (availability) {
      case 'available':
        return 'text-green-600 dark:text-green-400';
      case 'busy':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'unavailable':
        return 'text-gray-400';
      default:
        return 'text-gray-400';
    }
  };

  const getExperienceLevelColor = (level) => {
    switch (level) {
      case 'beginner':
        return 'badge-success';
      case 'intermediate':
        return 'badge-warning';
      case 'advanced':
        return 'badge-primary';
      case 'expert':
        return 'badge-danger';
      default:
        return 'badge-secondary';
    }
  };

  if (compact) {
    return (
      <div className={`flex items-center space-x-3 p-3 bg-white dark:bg-gray-800 rounded-lg shadow ${className}`}>
        <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center flex-shrink-0">
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <UserIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 dark:text-white truncate">
              {user?.name}
            </h3>
            <div className="flex items-center space-x-1">
              {renderStars(user?.rating?.average || 0)}
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-1">
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <MapPinIcon className="w-3 h-3 mr-1" />
              {user?.location || 'No location'}
            </div>
            <div className={`flex items-center text-sm ${getAvailabilityColor(user?.availability)}`}>
              <div className={`w-2 h-2 rounded-full mr-1 ${
                user?.availability === 'available' 
                  ? 'bg-green-500' 
                  : user?.availability === 'busy'
                  ? 'bg-yellow-500'
                  : 'bg-gray-400'
              }`}></div>
              {user?.availability || 'available'}
            </div>
          </div>
          
          <div className="flex flex-wrap gap-1 mt-2">
            {user?.skillsOffered?.slice(0, 2).map((skill, index) => (
              <span
                key={index}
                className="text-xs px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full"
              >
                {skill.name}
              </span>
            ))}
            {user?.skillsWanted?.slice(0, 1).map((skill, index) => (
              <span
                key={index}
                className="text-xs px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full"
              >
                {skill.name}
              </span>
            ))}
          </div>
        </div>
        
        {showActions && (
          <div className="flex flex-col space-y-1">
            <Link
              to={`/profile/${user?._id}`}
              className="btn btn-outline btn-sm"
            >
              View
            </Link>
            <Link
              to={`/requests/new?user=${user?._id}`}
              className="btn btn-primary btn-sm"
            >
              <ChatBubbleLeftRightIcon className="w-3 h-3" />
            </Link>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`card hover:shadow-lg transition-shadow duration-300 ${className}`}>
      <div className="card-body">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <UserIcon className="w-8 h-8 text-primary-600 dark:text-primary-400" />
              )}
            </div>
            
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {user?.name}
              </h3>
              
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-1">
                <MapPinIcon className="w-4 h-4 mr-1" />
                {user?.location || 'Location not specified'}
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  {renderStars(user?.rating?.average || 0)}
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  ({user?.rating?.count || 0} reviews)
                </span>
              </div>
            </div>
          </div>
          
          {/* Status Badge */}
          <div className="text-right">
            <span className={`badge ${getExperienceLevelColor(user?.experienceLevel)}`}>
              {user?.experienceLevel || 'intermediate'}
            </span>
            <div className={`flex items-center text-sm mt-2 ${getAvailabilityColor(user?.availability)}`}>
              <div className={`w-2 h-2 rounded-full mr-1 ${
                user?.availability === 'available' 
                  ? 'bg-green-500' 
                  : user?.availability === 'busy'
                  ? 'bg-yellow-500'
                  : 'bg-gray-400'
              }`}></div>
              {user?.availability || 'available'}
            </div>
          </div>
        </div>

        {/* Bio */}
        {user?.bio && (
          <div className="mb-4">
            <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
              {user.bio}
            </p>
          </div>
        )}

        {/* Skills */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
              Skills Offered
            </h4>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {user?.skillsOffered?.length || 0} skills
            </span>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-3">
            {user?.skillsOffered?.slice(0, 4).map((skill, index) => (
              <span
                key={index}
                className="text-xs px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full"
              >
                {skill.name}
              </span>
            ))}
            {(user?.skillsOffered?.length || 0) > 4 && (
              <span className="text-xs px-2 py-1 bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded-full">
                +{(user?.skillsOffered?.length || 0) - 4} more
              </span>
            )}
          </div>
          
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
              Skills Wanted
            </h4>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {user?.skillsWanted?.length || 0} skills
            </span>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {user?.skillsWanted?.slice(0, 4).map((skill, index) => (
              <span
                key={index}
                className="text-xs px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full"
              >
                {skill.name}
              </span>
            ))}
            {(user?.skillsWanted?.length || 0) > 4 && (
              <span className="text-xs px-2 py-1 bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded-full">
                +{(user?.skillsWanted?.length || 0) - 4} more
              </span>
            )}
          </div>
        </div>

        {/* Statistics */}
        <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {user?.totalSwaps || 0}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Total Swaps
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {user?.completedSwaps || 0}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Completed
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {user?.profileCompletion || 0}%
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Profile
            </div>
          </div>
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex justify-between items-center">
            <div className="flex space-x-2">
              <Link
                to={`/profile/${user?._id}`}
                className="btn btn-outline btn-sm"
              >
                <UserIcon className="w-4 h-4 mr-1" />
                Profile
              </Link>
              
              <Link
                to={`/requests/new?user=${user?._id}`}
                className="btn btn-primary btn-sm"
              >
                <ChatBubbleLeftRightIcon className="w-4 h-4 mr-1" />
                Request Swap
              </Link>
            </div>
            
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <AcademicCapIcon className="w-4 h-4 mr-1" />
              Joined {new Date(user?.createdAt).toLocaleDateString()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserCard;
