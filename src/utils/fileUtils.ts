
export const generateFilePath = (customerId: string, originalFilename: string): string => {
  const timestamp = Date.now();
  const fileExtension = originalFilename.split('.').pop();
  return `${customerId}/${timestamp}.${fileExtension}`;
};

export const getFileExtension = (filename: string): string => {
  return filename.split('.').pop() || '';
};

export const isValidFileType = (filename: string, allowedTypes: string[]): boolean => {
  const extension = getFileExtension(filename).toLowerCase();
  return allowedTypes.includes(extension);
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
