
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCustomerFormulas, getAllFormulas, deleteFormula } from '@/services/formulaService';
import { toast } from 'sonner';

export const useCustomerFormulas = (customerId?: string) => {
  return useQuery({
    queryKey: ['formulas', 'customer', customerId],
    queryFn: () => customerId ? getCustomerFormulas(customerId) : Promise.resolve([]),
    enabled: !!customerId,
    refetchOnWindowFocus: false,
  });
};

export const useAllFormulas = () => {
  return useQuery({
    queryKey: ['formulas', 'all'],
    queryFn: getAllFormulas,
    refetchOnWindowFocus: false,
  });
};

export const useDeleteFormula = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ formulaId, filePath }: { formulaId: string; filePath?: string }) =>
      deleteFormula(formulaId, filePath),
    onSuccess: () => {
      toast.success('Formula deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['formulas'] });
    },
    onError: (error: any) => {
      console.error('Delete formula error:', error);
      toast.error(error.message || 'Failed to delete formula');
    },
  });
};
