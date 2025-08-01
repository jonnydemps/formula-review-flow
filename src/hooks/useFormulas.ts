
import { useQueryClient } from '@tanstack/react-query';
import { getCustomerFormulas, getAllFormulas, deleteFormula } from '@/services/formulaService';
import { showSuccessToast, showErrorToast } from '@/utils/toastUtils';
import { useOptimizedFormulasQuery } from './useOptimizedQuery';
import { useMutation } from '@tanstack/react-query';
import { Formula } from '@/types/formula';

export const useCustomerFormulas = (customerId?: string) => {
  return useOptimizedFormulasQuery<Formula[]>(
    ['formulas', 'customer', customerId],
    () => customerId ? getCustomerFormulas(customerId) : Promise.resolve([]),
    {
      enabled: !!customerId,
      retry: (failureCount, error) => {
        if (failureCount < 3) {
          const message = error instanceof Error ? error.message : 'Unknown error';
          return message.toLowerCase().includes('network') || message.toLowerCase().includes('fetch');
        }
        return false;
      },
    }
  );
};

export const useAllFormulas = () => {
  return useOptimizedFormulasQuery<Formula[]>(
    ['formulas', 'all'],
    getAllFormulas,
    {
      retry: (failureCount, error) => {
        if (failureCount < 3) {
          const message = error instanceof Error ? error.message : 'Unknown error';
          return message.toLowerCase().includes('network') || message.toLowerCase().includes('fetch');
        }
        return false;
      },
    }
  );
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
