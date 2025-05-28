
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCustomerFormulas, getAllFormulas, deleteFormula } from '@/services/formulaService';
import { showSuccessToast, showErrorToast } from '@/utils/toastUtils';

export const useCustomerFormulas = (customerId?: string) => {
  return useQuery({
    queryKey: ['formulas', 'customer', customerId],
    queryFn: () => customerId ? getCustomerFormulas(customerId) : Promise.resolve([]),
    enabled: !!customerId,
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      // Retry up to 3 times for network errors
      if (failureCount < 3) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return message.toLowerCase().includes('network') || message.toLowerCase().includes('fetch');
      }
      return false;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

export const useAllFormulas = () => {
  return useQuery({
    queryKey: ['formulas', 'all'],
    queryFn: getAllFormulas,
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      if (failureCount < 3) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return message.toLowerCase().includes('network') || message.toLowerCase().includes('fetch');
      }
      return false;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

export const useDeleteFormula = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ formulaId, filePath }: { formulaId: string; filePath?: string }) =>
      deleteFormula(formulaId, filePath),
    onSuccess: () => {
      showSuccessToast('Formula deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['formulas'] });
    },
    onError: (error: any) => {
      console.error('Delete formula error:', error);
      showErrorToast(error, 'Delete Failed');
    },
  });
};
