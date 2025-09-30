import React from 'react';

const LoadingSpinner = ({
  size = 'md',
  variant = 'spinner',
  className = '',
  text = null
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };

  // Spinner variant
  if (variant === 'spinner') {
    return (
      <div className={`flex flex-col items-center justify-center ${className}`} role="status" aria-label="Loading">
        <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-primary-600 ${sizeClasses[size]}`}></div>
        {text && (
          <p className="mt-3 text-sm text-gray-600 animate-pulse">{text}</p>
        )}
      </div>
    );
  }

  // Pulse variant
  if (variant === 'pulse') {
    return (
      <div className={`flex flex-col items-center justify-center ${className}`}>
        <div className={`animate-pulse rounded-full bg-gradient-to-r from-primary-400 to-primary-600 ${sizeClasses[size]}`}></div>
        {text && (
          <p className="mt-3 text-sm text-gray-600 animate-pulse">{text}</p>
        )}
      </div>
    );
  }

  // Dots variant
  if (variant === 'dots') {
    return (
      <div className={`flex items-center justify-center space-x-1 ${className}`} role="status" aria-label="Loading">
        <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce"></div>
        <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce delay-100"></div>
        <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce delay-200"></div>
        {text && (
          <span className="ml-3 text-sm text-gray-600 animate-pulse">{text}</span>
        )}
      </div>
    );
  }

  // Ring variant
  if (variant === 'ring') {
    return (
      <div className={`flex flex-col items-center justify-center ${className}`}>
        <div className={`relative ${sizeClasses[size]}`}>
          <div className="absolute inset-0 rounded-full border-2 border-gray-200"></div>
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary-600 animate-spin"></div>
        </div>
        {text && (
          <p className="mt-3 text-sm text-gray-600 animate-pulse">{text}</p>
        )}
      </div>
    );
  }

  // Skeleton card variant
  if (variant === 'skeleton-card') {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="border rounded-lg p-6 bg-white">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-5 bg-gray-200 rounded-full w-16"></div>
              </div>
              <div className="h-3 bg-gray-200 rounded w-full mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
            <div className="h-8 w-20 bg-gray-200 rounded"></div>
          </div>
          <div className="flex items-center space-x-6">
            <div className="h-3 bg-gray-200 rounded w-16"></div>
            <div className="h-3 bg-gray-200 rounded w-12"></div>
            <div className="h-3 bg-gray-200 rounded w-14"></div>
          </div>
        </div>
      </div>
    );
  }

  // Skeleton stats variant
  if (variant === 'skeleton-stats') {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="p-3 rounded-md bg-gray-200">
                <div className="h-6 w-6 bg-gray-300 rounded"></div>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <div className="h-4 bg-gray-200 rounded w-20 mb-1"></div>
              <div className="h-6 bg-gray-200 rounded w-12"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  // Skeleton PR card variant
  if (variant === 'skeleton-pr-card') {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="border border-gray-200 rounded-lg p-4 bg-white">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <div className="h-5 bg-gray-200 rounded w-32"></div>
                <div className="h-6 bg-gray-200 rounded-full w-20"></div>
              </div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
            <div className="h-8 w-24 bg-gray-200 rounded"></div>
          </div>
          <div className="flex items-center space-x-6">
            <div className="h-4 bg-gray-200 rounded w-24"></div>
            <div className="h-4 bg-gray-200 rounded w-16"></div>
            <div className="h-4 bg-gray-200 rounded w-20"></div>
          </div>
        </div>
      </div>
    );
  }

  // Default spinner
  return (
    <div className={`flex flex-col items-center justify-center ${className}`} role="status" aria-label="Loading">
      <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-primary-600 ${sizeClasses[size]}`}></div>
      {text && (
        <p className="mt-3 text-sm text-gray-600 animate-pulse">{text}</p>
      )}
    </div>
  );
};

export default LoadingSpinner;
