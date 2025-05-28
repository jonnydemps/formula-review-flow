
import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface ErrorDisplayProps {
  error: string | Error;
  onRetry?: () => void;
  variant?: 'alert' | 'card' | 'inline';
  className?: string;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ 
  error, 
  onRetry, 
  variant = 'alert',
  className 
}) => {
  const errorMessage = error instanceof Error ? error.message : error;

  if (variant === 'inline') {
    return (
      <div className={`text-center py-4 ${className}`}>
        <AlertTriangle className="h-6 w-6 mx-auto text-red-500 mb-2" />
        <p className="text-red-600 text-sm">{errorMessage}</p>
        {onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry} className="mt-2">
            <RefreshCw className="h-3 w-3 mr-1" />
            Retry
          </Button>
        )}
      </div>
    );
  }

  return (
    <Alert variant="destructive" className={className}>
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription className="mt-2">
        {errorMessage}
        {onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry} className="mt-2 ml-0">
            <RefreshCw className="h-3 w-3 mr-1" />
            Try Again
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
};

export default ErrorDisplay;
