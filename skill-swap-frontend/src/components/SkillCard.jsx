import React from 'react';
import { Link } from 'react-router-dom';
import {
  StarIcon,
  MapPinIcon,
  AcademicCapIcon,
  UserIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';

/**
 * SkillCard Component
 * Displays skill information with user details and actions
 */
const SkillCard = ({ skill, user, showActions = true, className = '' }) => {
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

  const getCategoryColor = (category) => {
    switch (category) {
      case 'programming':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'design':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'marketing':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'writing':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'music':
        return 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200';
      case 'language':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200';
      case 'business':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
      case 'fitness':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'cooking':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  return (
    <div className={`card hover:shadow-lg transition-shadow duration-300 ${className}`}>
      <div className="card-body">
        {/* User Info */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <UserIcon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {user?.name}
              </h3>
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <MapPinIcon className="w-4 h-4 mr-1" />
                {user?.location || 'Location not specified'}
              </div>
            </div>
          </div>
          
          {/* Rating */}
          <div className="text-right">
            <div className="flex items-center space-x-1">
              {renderStars(user?.rating?.average || 0)}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              ({user?.rating?.count || 0} reviews)
            </p>
          </div>
        </div>

        {/* Skill Details */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
              {skill?.name}
            </h4>
            <span className={`badge ${getExperienceLevelColor(skill?.experienceLevel)}`}>
              {skill?.experienceLevel}
            </span>
          </div>
          
          <div className="flex items-center space-x-2 mb-3">
            <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(skill?.category)}`}>
              {skill?.category}
            </span>
            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
              <AcademicCapIcon className="w-3 h-3 mr-1" />
              {user?.completedSwaps || 0} swaps completed
            </div>
          </div>
          
          {skill?.description && (
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
              {skill.description}
            </p>
          )}
        </div>

        {/* User Bio */}
        {user?.bio && (
          <div className="mb-4">
            <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
              {user.bio}
            </p>
          </div>
        )}

        {/* Skills Offered/Wanted */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {user?.skillsOffered?.slice(0, 2).map((offeredSkill, index) => (
              <span
                key={index}
                className="text-xs px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full"
              >
                {offeredSkill.name}
              </span>
            ))}
            {user?.skillsWanted?.slice(0, 2).map((wantedSkill, index) => (
              <span
                key={index}
                className="text-xs px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full"
              >
                {wantedSkill.name}
              </span>
            ))}
          </div>
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                user?.availability === 'available' 
                  ? 'bg-green-500' 
                  : user?.availability === 'busy'
                  ? 'bg-yellow-500'
                  : 'bg-gray-400'
              }`}></div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {user?.availability || 'available'}
              </span>
            </div>
            
            <div className="flex space-x-2">
              <Link
                to={`/profile/${user?._id}`}
                className="btn btn-outline btn-sm"
              >
                View Profile
              </Link>
              <Link
                to={`/requests/new?user=${user?._id}&skill=${skill?.name}`}
                className="btn btn-primary btn-sm"
              >
                <ChatBubbleLeftRightIcon className="w-4 h-4 mr-1" />
                Request Swap
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SkillCard;
