
import { toast } from 'sonner';
import { getErrorMessage, categorizeError } from './errorUtils';

export const showSuccessToast = (message: string, description?: string) => {
  toast.success(message, { 
    description,
    duration: 4000,
  });
};

export const showErrorToast = (error: unknown, title = 'Error') => {
  const message = getErrorMessage(error);
  const category = categorizeError(error);
  
  const categoryTitles = {
    network: 'Connection Error',
    auth: 'Authentication Error', 
    validation: 'Validation Error',
    server: 'Server Error',
    unknown: 'Error'
  };
  
  const categoryDurations = {
    network: 8000,
    auth: 6000,
    validation: 5000,
    server: 6000,
    unknown: 4000
  };
  
  toast.error(categoryTitles[category], {
    description: message,
    duration: categoryDurations[category],
    action: category === 'network' ? {
      label: 'Retry',
      onClick: () => window.location.reload()
    } : undefined
  });
};

export const showWarningToast = (message: string, description?: string) => {
  toast.warning(message, { 
    description,
    duration: 5000,
  });
};

export const showInfoToast = (message: string, description?: string) => {
  toast.info(message, { 
    description,
    duration: 3000,
  });
};

export const showLoadingToast = (message: string, promise: Promise<any>) => {
  return toast.promise(promise, {
    loading: message,
    success: (data) => ({
      title: 'Operation completed successfully',
      description: data?.message || 'The operation was completed without issues.'
    }),
    error: (error) => ({
      title: 'Operation failed',
      description: getErrorMessage(error)
    })
  });
};

export const showProgressToast = (message: string, progress: number) => {
  toast.info(message, {
    description: `Progress: ${Math.round(progress)}%`,
    duration: 2000,
  });
};

export const showActionToast = (message: string, actionLabel: string, actionFn: () => void) => {
  toast.info(message, {
    action: {
      label: actionLabel,
      onClick: actionFn
    },
    duration: 6000,
  });
};
