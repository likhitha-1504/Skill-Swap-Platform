import React from 'react';

/**
 * LoadingSpinner Component
 * Reusable loading spinner with different sizes and variants
 */
const LoadingSpinner = ({ 
  size = 'md', 
  variant = 'primary',
  className = '',
  text = ''
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  const variantClasses = {
    primary: 'text-primary-600',
    secondary: 'text-secondary-600',
    white: 'text-white',
    dark: 'text-gray-900',
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="flex flex-col items-center">
        <div
          className={`
            ${sizeClasses[size]} 
            ${variantClasses[variant]}
            border-2 border-current border-t-transparent rounded-full animate-spin
          `}
          aria-hidden="true"
        />
        {text && (
          <span className={`mt-2 text-sm ${variantClasses[variant]}`}>
            {text}
          </span>
        )}
      </div>
    </div>
  );
};

export default LoadingSpinner;
