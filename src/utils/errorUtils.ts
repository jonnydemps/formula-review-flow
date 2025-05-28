
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unknown error occurred';
};

export const handleAuthError = (error: any): string => {
  if (error.message?.includes('Invalid login credentials')) {
    return 'Invalid email or password. Please try again.';
  }
  if (error.message?.includes('Email not confirmed')) {
    return 'Please confirm your email before signing in.';
  }
  if (error.message?.includes('Invalid API key')) {
    return 'Authentication service configuration error. Please contact support.';
  }
  if (error.message?.includes('signup disabled')) {
    return 'New registrations are currently disabled. Please contact support.';
  }
  return error.message || 'Authentication failed';
};

export const handleUploadError = (error: any): string => {
  if (error.message?.includes('Storage error')) {
    return 'File storage error. Please try again.';
  }
  if (error.message?.includes('File too large')) {
    return 'File is too large. Please choose a smaller file.';
  }
  if (error.message?.includes('Invalid file type')) {
    return 'Invalid file type. Please upload a supported file format.';
  }
  return error.message || 'Upload failed';
};

export const handleNetworkError = (error: any): string => {
  if (error.message?.includes('Failed to fetch')) {
    return 'Network error. Please check your connection and try again.';
  }
  if (error.message?.includes('timeout')) {
    return 'Request timed out. Please try again.';
  }
  return error.message || 'Network error occurred';
};

export const isRetryableError = (error: any): boolean => {
  const retryableMessages = [
    'Network error',
    'timeout',
    'Failed to fetch',
    'Service temporarily unavailable',
    'Rate limit exceeded'
  ];
  
  const message = getErrorMessage(error).toLowerCase();
  return retryableMessages.some(retryable => message.includes(retryable));
};

export const categorizeError = (error: any): 'network' | 'auth' | 'validation' | 'server' | 'unknown' => {
  const message = getErrorMessage(error).toLowerCase();
  
  if (message.includes('network') || message.includes('fetch') || message.includes('timeout')) {
    return 'network';
  }
  if (message.includes('auth') || message.includes('login') || message.includes('unauthorized')) {
    return 'auth';
  }
  if (message.includes('validation') || message.includes('invalid') || message.includes('required')) {
    return 'validation';
  }
  if (message.includes('server') || message.includes('internal')) {
    return 'server';
  }
  return 'unknown';
};
