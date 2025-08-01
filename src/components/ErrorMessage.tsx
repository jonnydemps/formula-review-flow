import React from 'react';
import { AlertCircle, RefreshCw, X } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface ErrorMessageProps {
  title?: string;
  message: string;
  variant?: 'destructive' | 'default';
  onRetry?: () => void;
  onDismiss?: () => void;
  retryLabel?: string;
  className?: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({
  title = 'Error',
  message,
  variant = 'destructive',
  onRetry,
  onDismiss,
  retryLabel = 'Try Again',
  className
}) => {
  const getIcon = () => {
    return <AlertCircle className="h-4 w-4" />;
  };

  return (
    <Alert variant={variant} className={className}>
      {getIcon()}
      <div className="flex-1">
        <AlertDescription>
          <div className="flex flex-col space-y-2">
            <div>
              <strong>{title}:</strong> {message}
            </div>
            {(onRetry || onDismiss) && (
              <div className="flex gap-2">
                {onRetry && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onRetry}
                    className="h-8"
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    {retryLabel}
                  </Button>
                )}
                {onDismiss && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onDismiss}
                    className="h-8"
                  >
                    <X className="h-3 w-3 mr-1" />
                    Dismiss
                  </Button>
                )}
              </div>
            )}
          </div>
        </AlertDescription>
      </div>
    </Alert>
  );
};

export default ErrorMessage;