import React from 'react';
import { Link } from 'react-router-dom';
import {
  StarIcon,
  MapPinIcon,
  AcademicCapIcon,
  UserIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
  CheckIcon,
  XMarkIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';

/**
 * RequestCard Component
 * Displays swap request information with actions
 */
const RequestCard = ({ 
  request, 
  currentUser, 
  showActions = true, 
  className = '' 
}) => {
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<StarSolid key={i} className="w-4 h-4 star-filled" />);
      } else {
        stars.push(<StarIcon key={i} className="w-4 h-4 star-empty" />);
      }
    }
    
    return stars;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'badge-warning';
      case 'accepted':
        return 'badge-success';
      case 'rejected':
        return 'badge-danger';
      case 'cancelled':
        return 'badge-secondary';
      case 'completed':
        return 'badge-primary';
      default:
        return 'badge-secondary';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <ClockIcon className="w-4 h-4" />;
      case 'accepted':
        return <CheckIcon className="w-4 h-4" />;
      case 'rejected':
        return <XMarkIcon className="w-4 h-4" />;
      case 'cancelled':
        return <XMarkIcon className="w-4 h-4" />;
      case 'completed':
        return <CheckIcon className="w-4 h-4" />;
      default:
        return <ClockIcon className="w-4 h-4" />;
    }
  };

  const isRequester = request?.requester?._id === currentUser?._id;
  const otherUser = isRequester ? request?.recipient : request?.requester;
  const canAccept = !isRequester && request?.status === 'pending';
  const canReject = !isRequester && request?.status === 'pending';
  const canCancel = isRequester && request?.status === 'pending';
  const canComplete = request?.status === 'accepted';

  return (
    <div className={`card hover:shadow-lg transition-shadow duration-300 ${className}`}>
      <div className="card-body">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
              {otherUser?.avatar ? (
                <img
                  src={otherUser.avatar}
                  alt={otherUser.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <UserIcon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              )}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {otherUser?.name}
                </h3>
                <span className={`badge ${getStatusColor(request?.status)}`}>
                  {getStatusIcon(request?.status)}
                  <span className="ml-1">{request?.status}</span>
                </span>
              </div>
              
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <MapPinIcon className="w-4 h-4 mr-1" />
                {otherUser?.location || 'Location not specified'}
              </div>
              
              <div className="flex items-center space-x-1 mt-1">
                {renderStars(otherUser?.rating?.average || 0)}
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  ({otherUser?.rating?.count || 0})
                </span>
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Requested {new Date(request?.createdAt).toLocaleDateString()}
            </div>
            {isRequester && (
              <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                You requested this swap
              </div>
            )}
          </div>
        </div>

        {/* Skills Exchange */}
        <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
              Skills Exchange
            </h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                {isRequester ? 'You Offer' : 'They Offer'}
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                  <AcademicCapIcon className="w-4 h-4 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {request?.skillOffered?.name}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {request?.skillOffered?.category}
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                {isRequester ? 'You Want' : 'They Want'}
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <AcademicCapIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {request?.skillWanted?.name}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {request?.skillWanted?.category}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Message */}
        {request?.message && (
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
              Message
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
              {request.message}
            </p>
          </div>
        )}

        {/* Schedule Details */}
        {request?.scheduledDate && (
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
              Schedule Details
            </h4>
            <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-300">
              <div className="flex items-center">
                <CalendarIcon className="w-4 h-4 mr-1" />
                {new Date(request.scheduledDate).toLocaleDateString()}
              </div>
              <div className="flex items-center">
                <ClockIcon className="w-4 h-4 mr-1" />
                {new Date(request.scheduledDate).toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </div>
              <div className="flex items-center">
                <span>Duration: {request?.duration || 60} minutes</span>
              </div>
            </div>
            {request?.location && (
              <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                Location: {request.location}
              </div>
            )}
            {request?.isOnline && (
              <div className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                Online session
              </div>
            )}
          </div>
        )}

        {/* Notes */}
        {request?.notes && (
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
              Additional Notes
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
              {request.notes}
            </p>
          </div>
        )}

        {/* Actions */}
        {showActions && (
          <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex space-x-2">
              <Link
                to={`/profile/${otherUser?._id}`}
                className="btn btn-outline btn-sm"
              >
                View Profile
              </Link>
              
              {request?.status === 'accepted' && (
                <Link
                  to={`/messages/${request?._id}`}
                  className="btn btn-primary btn-sm"
                >
                  <ChatBubbleLeftRightIcon className="w-4 h-4 mr-1" />
                  Chat
                </Link>
              )}
            </div>
            
            <div className="flex space-x-2">
              {canAccept && (
                <button className="btn btn-success btn-sm">
                  <CheckIcon className="w-4 h-4 mr-1" />
                  Accept
                </button>
              )}
              
              {canReject && (
                <button className="btn btn-danger btn-sm">
                  <XMarkIcon className="w-4 h-4 mr-1" />
                  Reject
                </button>
              )}
              
              {canCancel && (
                <button className="btn btn-outline btn-sm">
                  <XMarkIcon className="w-4 h-4 mr-1" />
                  Cancel
                </button>
              )}
              
              {canComplete && (
                <button className="btn btn-primary btn-sm">
                  <CheckIcon className="w-4 h-4 mr-1" />
                  Complete
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RequestCard;
