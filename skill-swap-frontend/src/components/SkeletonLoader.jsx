import React from 'react';

/**
 * SkeletonLoader Component
 * Provides skeleton loading states for different UI elements
 */
const SkeletonLoader = ({ type, className = '' }) => {
  const renderSkeleton = () => {
    switch (type) {
      case 'card':
        return (
          <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 ${className}`}>
            <div className="flex items-center space-x-4 mb-4">
              <div className="skeleton w-12 h-12 rounded-full"></div>
              <div className="flex-1">
                <div className="skeleton h-4 w-3/4 rounded mb-2"></div>
                <div className="skeleton h-3 w-1/2 rounded"></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="skeleton h-3 w-full rounded"></div>
              <div className="skeleton h-3 w-5/6 rounded"></div>
              <div className="skeleton h-3 w-4/6 rounded"></div>
            </div>
            <div className="flex justify-between items-center mt-4">
              <div className="skeleton h-8 w-20 rounded"></div>
              <div className="skeleton h-8 w-20 rounded"></div>
            </div>
          </div>
        );

      case 'user-card':
        return (
          <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 ${className}`}>
            <div className="flex items-center space-x-4">
              <div className="skeleton w-16 h-16 rounded-full"></div>
              <div className="flex-1">
                <div className="skeleton h-5 w-3/4 rounded mb-2"></div>
                <div className="skeleton h-4 w-1/2 rounded mb-2"></div>
                <div className="skeleton h-3 w-2/3 rounded"></div>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <div className="skeleton h-6 w-16 rounded-full"></div>
              <div className="skeleton h-6 w-20 rounded-full"></div>
              <div className="skeleton h-6 w-14 rounded-full"></div>
            </div>
          </div>
        );

      case 'skill-card':
        return (
          <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 ${className}`}>
            <div className="skeleton h-6 w-3/4 rounded mb-4"></div>
            <div className="skeleton h-4 w-full rounded mb-2"></div>
            <div className="skeleton h-4 w-5/6 rounded mb-4"></div>
            <div className="flex justify-between items-center">
              <div className="skeleton h-4 w-16 rounded"></div>
              <div className="skeleton h-8 w-24 rounded"></div>
            </div>
          </div>
        );

      case 'request-card':
        return (
          <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 ${className}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="skeleton w-10 h-10 rounded-full"></div>
                <div>
                  <div className="skeleton h-4 w-24 rounded mb-1"></div>
                  <div className="skeleton h-3 w-16 rounded"></div>
                </div>
              </div>
              <div className="skeleton h-6 w-16 rounded-full"></div>
            </div>
            <div className="space-y-2 mb-4">
              <div className="skeleton h-3 w-full rounded"></div>
              <div className="skeleton h-3 w-4/5 rounded"></div>
            </div>
            <div className="flex justify-end space-x-2">
              <div className="skeleton h-8 w-16 rounded"></div>
              <div className="skeleton h-8 w-16 rounded"></div>
            </div>
          </div>
        );

      case 'message':
        return (
          <div className={`flex items-start space-x-3 ${className}`}>
            <div className="skeleton w-8 h-8 rounded-full flex-shrink-0"></div>
            <div className="flex-1">
              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
                <div className="skeleton h-4 w-3/4 rounded mb-2"></div>
                <div className="skeleton h-3 w-full rounded"></div>
              </div>
              <div className="skeleton h-3 w-16 rounded mt-2"></div>
            </div>
          </div>
        );

      case 'review':
        return (
          <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 ${className}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="skeleton w-10 h-10 rounded-full"></div>
                <div>
                  <div className="skeleton h-4 w-24 rounded mb-1"></div>
                  <div className="flex space-x-1">
                    <div className="skeleton h-4 w-4 rounded"></div>
                    <div className="skeleton h-4 w-4 rounded"></div>
                    <div className="skeleton h-4 w-4 rounded"></div>
                    <div className="skeleton h-4 w-4 rounded"></div>
                    <div className="skeleton h-4 w-4 rounded"></div>
                  </div>
                </div>
              </div>
              <div className="skeleton h-3 w-16 rounded"></div>
            </div>
            <div className="space-y-2">
              <div className="skeleton h-4 w-full rounded"></div>
              <div className="skeleton h-4 w-5/6 rounded"></div>
              <div className="skeleton h-4 w-4/6 rounded"></div>
            </div>
          </div>
        );

      case 'form':
        return (
          <div className={`space-y-6 ${className}`}>
            <div>
              <div className="skeleton h-4 w-24 rounded mb-2"></div>
              <div className="skeleton h-10 w-full rounded"></div>
            </div>
            <div>
              <div className="skeleton h-4 w-20 rounded mb-2"></div>
              <div className="skeleton h-10 w-full rounded"></div>
            </div>
            <div>
              <div className="skeleton h-4 w-32 rounded mb-2"></div>
              <div className="skeleton h-24 w-full rounded"></div>
            </div>
            <div className="flex space-x-4">
              <div className="skeleton h-10 w-24 rounded"></div>
              <div className="skeleton h-10 w-32 rounded"></div>
            </div>
          </div>
        );

      case 'table':
        return (
          <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden ${className}`}>
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="skeleton h-6 w-48 rounded"></div>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="p-4">
                  <div className="flex items-center space-x-4">
                    <div className="skeleton w-8 h-8 rounded-full"></div>
                    <div className="flex-1">
                      <div className="skeleton h-4 w-32 rounded mb-2"></div>
                      <div className="skeleton h-3 w-24 rounded"></div>
                    </div>
                    <div className="skeleton h-4 w-16 rounded"></div>
                    <div className="skeleton h-8 w-20 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'stats':
        return (
          <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <div className="skeleton h-8 w-8 rounded mb-4"></div>
                <div className="skeleton h-8 w-16 rounded mb-2"></div>
                <div className="skeleton h-4 w-24 rounded"></div>
              </div>
            ))}
          </div>
        );

      case 'list':
        return (
          <div className={`space-y-4 ${className}`}>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
                <div className="flex items-center space-x-3">
                  <div className="skeleton w-8 h-8 rounded-full"></div>
                  <div>
                    <div className="skeleton h-4 w-32 rounded mb-1"></div>
                    <div className="skeleton h-3 w-24 rounded"></div>
                  </div>
                </div>
                <div className="skeleton h-8 w-20 rounded"></div>
              </div>
            ))}
          </div>
        );

      default:
        return (
          <div className={`skeleton h-4 w-full rounded ${className}`}></div>
        );
    }
  };

  return (
    <div className="animate-pulse">
      {renderSkeleton()}
    </div>
  );
};

export default SkeletonLoader;
