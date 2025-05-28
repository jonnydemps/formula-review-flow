
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { uploadFormulaFile, createFormula } from '@/services/formulaService';
import { handleUploadError } from '@/utils/errorUtils';
import { showSuccessToast, showErrorToast } from '@/utils/toastUtils';

interface UploadProgress {
  isUploading: boolean;
  progress: number;
}

export const useFormUpload = (customerId?: string) => {
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({
    isUploading: false,
    progress: 0,
  });
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      if (!customerId) throw new Error('Customer ID is required');
      
      setUploadProgress({ isUploading: true, progress: 0 });
      
      // Generate unique file path
      const timestamp = Date.now();
      const fileExtension = file.name.split('.').pop();
      const filePath = `${customerId}/${timestamp}.${fileExtension}`;
      
      setUploadProgress({ isUploading: true, progress: 30 });
      
      // Upload file to storage
      await uploadFormulaFile(file, filePath);
      
      setUploadProgress({ isUploading: true, progress: 70 });
      
      // Create formula record
      const formula = await createFormula(customerId, filePath, file.name);
      
      setUploadProgress({ isUploading: true, progress: 100 });
      
      return formula;
    },
    onSuccess: () => {
      showSuccessToast('Formula uploaded successfully!');
      queryClient.invalidateQueries({ queryKey: ['formulas'] });
      setUploadProgress({ isUploading: false, progress: 0 });
    },
    onError: (error: any) => {
      console.error('Upload error:', error);
      const errorMessage = handleUploadError(error);
      showErrorToast(errorMessage, 'Upload Failed');
      setUploadProgress({ isUploading: false, progress: 0 });
    },
  });

  return {
    uploadFormula: uploadMutation.mutate,
    uploadProgress,
    isUploading: uploadProgress.isUploading,
  };
};
