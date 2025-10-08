import React from 'react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  withLogo?: boolean;
}

export const Spinner: React.FC<SpinnerProps> = ({ 
  size = 'md', 
  className = '',
  withLogo = false 
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
    xl: 'w-32 h-32'
  };

  const logoSizes = {
    sm: 'w-5 h-5',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20'
  };

  return (
    <div className={`relative ${sizeClasses[size]} ${className}`}>
      {/* Outer ring */}
      <div className="absolute inset-0 rounded-full border-4 border-gray-700/30"></div>
      
      {/* Primary spinning ring */}
      <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-emerald-500 border-r-emerald-500 animate-spin"></div>
      
      {/* Secondary counter-spinning ring */}
      <div 
        className="absolute inset-2 rounded-full border-4 border-transparent border-t-blue-500 border-l-blue-500 animate-spin" 
        style={{ animationDirection: 'reverse', animationDuration: '1s' }}
      ></div>
      
      {/* Logo in center (optional) */}
      {withLogo && (
        <div className="absolute inset-0 flex items-center justify-center">
          <img 
            src="/karma-club-logo.png" 
            alt="Loading" 
            className={`${logoSizes[size]} object-contain opacity-90`}
          />
        </div>
      )}
    </div>
  );
};

// Alternative: Pure CSS spinning circles without logo
export const SpinnerCircles: React.FC<SpinnerProps> = ({ 
  size = 'md', 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
    xl: 'w-32 h-32'
  };

  return (
    <div className={`relative ${sizeClasses[size]} ${className}`}>
      {/* Gradient spinning ring */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-emerald-500 via-blue-500 to-purple-500 opacity-75 animate-spin"></div>
      <div className="absolute inset-1 rounded-full bg-gray-900"></div>
      
      {/* Inner accent ring */}
      <div className="absolute inset-3 rounded-full border-2 border-dashed border-emerald-400/50 animate-spin" style={{ animationDuration: '3s', animationDirection: 'reverse' }}></div>
    </div>
  );
};

// Modern dots spinner
export const SpinnerDots: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`flex space-x-2 ${className}`}>
      <div className="w-3 h-3 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
      <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
      <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
    </div>
  );
};
