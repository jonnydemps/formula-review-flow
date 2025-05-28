
import { useState, useCallback } from 'react';
import { getErrorMessage } from '@/utils/errorUtils';

interface UseAsyncOperationState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseAsyncOperationReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  execute: (...args: any[]) => Promise<T>;
  reset: () => void;
}

export const useAsyncOperation = <T>(
  asyncFunction: (...args: any[]) => Promise<T>
): UseAsyncOperationReturn<T> => {
  const [state, setState] = useState<UseAsyncOperationState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(async (...args: any[]): Promise<T> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const result = await asyncFunction(...args);
      setState({ data: result, loading: false, error: null });
      return result;
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      throw error;
    }
  }, [asyncFunction]);

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
};
