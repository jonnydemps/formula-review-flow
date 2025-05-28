
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
  return error.message || 'Authentication failed';
};

export const handleUploadError = (error: any): string => {
  if (error.message?.includes('Storage error')) {
    return 'File storage error. Please try again.';
  }
  if (error.message?.includes('File too large')) {
    return 'File is too large. Please choose a smaller file.';
  }
  return error.message || 'Upload failed';
};
