
import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingStateProps {
  variant?: 'page' | 'section' | 'inline' | 'button';
  message?: string;
  className?: string;
}

const LoadingState: React.FC<LoadingStateProps> = ({ 
  variant = 'section', 
  message, 
  className 
}) => {
  const baseClasses = "flex items-center justify-center";
  
  const variantClasses = {
    page: "min-h-screen",
    section: "py-12",
    inline: "py-4",
    button: "py-2"
  };

  const iconSizes = {
    page: "h-12 w-12",
    section: "h-8 w-8", 
    inline: "h-6 w-6",
    button: "h-4 w-4"
  };

  return (
    <div className={cn(baseClasses, variantClasses[variant], className)}>
      <div className="text-center">
        <Loader2 className={cn(iconSizes[variant], "animate-spin mx-auto text-ra-blue")} />
        {message && (
          <p className="mt-2 text-gray-500 text-sm">{message}</p>
        )}
      </div>
    </div>
  );
};

export default LoadingState;
