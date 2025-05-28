
import { useState, useCallback } from 'react';
import { toast } from 'sonner';

interface UseRetryOptions {
  maxAttempts?: number;
  delayMs?: number;
  onRetry?: (attempt: number) => void;
}

export const useRetry = (options: UseRetryOptions = {}) => {
  const { maxAttempts = 3, delayMs = 1000, onRetry } = options;
  const [attempt, setAttempt] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  const retry = useCallback(async <T>(operation: () => Promise<T>): Promise<T> => {
    let lastError: Error;
    
    for (let i = 0; i <= maxAttempts; i++) {
      try {
        setAttempt(i);
        if (i > 0) {
          setIsRetrying(true);
          onRetry?.(i);
          await new Promise(resolve => setTimeout(resolve, delayMs * i));
        }
        
        const result = await operation();
        setIsRetrying(false);
        setAttempt(0);
        return result;
      } catch (error) {
        lastError = error as Error;
        if (i === maxAttempts) {
          setIsRetrying(false);
          setAttempt(0);
          break;
        }
      }
    }
    
    throw lastError!;
  }, [maxAttempts, delayMs, onRetry]);

  return { retry, attempt, isRetrying };
};
