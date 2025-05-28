
import { toast } from 'sonner';
import { getErrorMessage, categorizeError } from './errorUtils';

export const showSuccessToast = (message: string, description?: string) => {
  toast.success(message, { description });
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
  
  toast.error(categoryTitles[category], {
    description: message,
    duration: category === 'network' ? 6000 : 4000
  });
};

export const showWarningToast = (message: string, description?: string) => {
  toast.warning(message, { description });
};

export const showInfoToast = (message: string, description?: string) => {
  toast.info(message, { description });
};

export const showLoadingToast = (message: string, promise: Promise<any>) => {
  return toast.promise(promise, {
    loading: message,
    success: 'Operation completed successfully',
    error: (error) => getErrorMessage(error)
  });
};
