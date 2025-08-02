/**
 * Loading Spinner Components
 * Reusable loading indicators for different use cases
 */

;

const LoadingSpinner = ({ 
  size = "md", 
  color = "white", 
  className = "",
  text = "",
  type = "spinner" 
}) => {
  const sizeClasses = {
    xs: "w-3 h-3",
    sm: "w-4 h-4", 
    md: "w-6 h-6",
    lg: "w-8 h-8",
    xl: "w-12 h-12"
  };

  const colorClasses = {
    white: "text-white",
    gray: "text-gray-400",
    blue: "text-blue-500",
    green: "text-green-500",
    red: "text-red-500"
  };

  if (type === "dots") {
    return (
      <div className={`flex items-center justify-center space-x-1 ${className}`}>
        <div className={`${sizeClasses[size]} ${colorClasses[color]} animate-bounce`}>
          <div className="w-full h-full bg-current rounded-full"></div>
        </div>
        <div className={`${sizeClasses[size]} ${colorClasses[color]} animate-bounce`} style={{ animationDelay: '0.1s' }}>
          <div className="w-full h-full bg-current rounded-full"></div>
        </div>
        <div className={`${sizeClasses[size]} ${colorClasses[color]} animate-bounce`} style={{ animationDelay: '0.2s' }}>
          <div className="w-full h-full bg-current rounded-full"></div>
        </div>
        {text && <span className="ml-2 text-sm text-gray-400">{text}</span>}
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className={`${sizeClasses[size]} ${colorClasses[color]} animate-spin rounded-full border-2 border-current border-t-transparent`}></div>
      {text && <span className="ml-2 text-sm text-gray-400">{text}</span>}
    </div>
  );
};

/**
 * Full Page Loading Screen
 */
export const FullPageLoader = ({ message = 'Loading...' }) => {
  return (
    <div className="fixed inset-0 bg-[#08080a] flex items-center justify-center z-50">
      <div className="text-center">
        <LoadingSpinner size={48} className="mb-4" />
        <p className="text-gray-400 text-lg">{message}</p>
      </div>
    </div>
  );
};

/**
 * Button Loading State
 */
export const ButtonLoader = ({ children, isLoading, loadingText, ...props }) => {
  return (
    <button {...props} disabled={isLoading || props.disabled}>
      {isLoading ? (
        <div className="flex items-center justify-center gap-2">
          <LoadingSpinner size={16} />
          {loadingText && <span>{loadingText}</span>}
        </div>
      ) : (
        children
      )}
    </button>
  );
};

/**
 * Card Loading Skeleton
 */
export const CardSkeleton = ({ lines = 3 }) => {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 animate-pulse">
      <div className="h-4 bg-gray-700 rounded w-3/4 mb-3"></div>
      {Array.from({ length: lines }, (_, i) => (
        <div key={i} className="h-3 bg-gray-700 rounded w-full mb-2"></div>
      ))}
      <div className="h-3 bg-gray-700 rounded w-1/2"></div>
    </div>
  );
};

/**
 * Table Loading Skeleton
 */
export const TableSkeleton = ({ rows = 5, columns = 4 }) => {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }, (_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4">
          {Array.from({ length: columns }, (_, colIndex) => (
            <div 
              key={colIndex} 
              className="h-8 bg-gray-700 rounded flex-1 animate-pulse"
            ></div>
          ))}
        </div>
      ))}
    </div>
  );
};

/**
 * Loading Overlay for components
 */
export const LoadingOverlay = ({ isLoading, children, message }) => {
  return (
    <div className="relative">
      {children}
      {isLoading && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
          <div className="bg-gray-900 p-4 rounded-lg text-center">
            <LoadingSpinner size={32} className="mb-2" />
            {message && <p className="text-gray-300 text-sm">{message}</p>}
          </div>
        </div>
      )}
    </div>
  );
};

export default LoadingSpinner;