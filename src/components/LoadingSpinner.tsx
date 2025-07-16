import React from 'react';
import { Compass } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  message = 'Chargement...' 
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className={`${sizeClasses[size]} animate-spin text-purple-400 mb-4`}>
        <Compass className="w-full h-full" />
      </div>
      <p className="text-white/70 text-sm sm:text-base">{message}</p>
    </div>
  );
};

export default LoadingSpinner;