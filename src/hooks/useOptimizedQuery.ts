import { useQuery, UseQueryOptions, QueryKey } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';

interface OptimizedQueryOptions<T> extends Omit<UseQueryOptions<T>, 'queryKey' | 'queryFn'> {
  cacheTime?: number;
  staleTime?: number;
  refetchOnMount?: boolean;
  refetchOnWindowFocus?: boolean;
  refetchOnReconnect?: boolean;
}

export const useOptimizedQuery = <T>(
  queryKey: QueryKey,
  queryFn: () => Promise<T>,
  options: OptimizedQueryOptions<T> = {}
) => {
  const {
    cacheTime = 5 * 60 * 1000, // 5 minutes
    staleTime = 30 * 1000, // 30 seconds
    refetchOnMount = false,
    refetchOnWindowFocus = false,
    refetchOnReconnect = true,
    retry = 3,
    retryDelay = (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    ...restOptions
  } = options;

  // Memoized query function to prevent unnecessary re-renders
  const memoizedQueryFn = useCallback(queryFn, []);

  // Optimized retry logic
  const optimizedRetry = useCallback((failureCount: number, error: Error) => {
    if (typeof retry === 'number') {
      return failureCount < retry;
    }
    if (typeof retry === 'function') {
      return retry(failureCount, error);
    }
    return failureCount < 3;
  }, [retry]);

  const queryOptions = useMemo(() => ({
    queryKey,
    queryFn: memoizedQueryFn,
    gcTime: cacheTime,
    staleTime,
    refetchOnMount,
    refetchOnWindowFocus,
    refetchOnReconnect,
    retry: optimizedRetry,
    retryDelay,
    ...restOptions,
  }), [
    queryKey,
    memoizedQueryFn,
    cacheTime,
    staleTime,
    refetchOnMount,
    refetchOnWindowFocus,
    refetchOnReconnect,
    optimizedRetry,
    retryDelay,
    restOptions
  ]);

  return useQuery(queryOptions);
};

// Specialized hook for frequently accessed data
export const useOptimizedFormulasQuery = <T>(
  queryKey: QueryKey,
  queryFn: () => Promise<T>,
  options: OptimizedQueryOptions<T> = {}
) => {
  return useOptimizedQuery(queryKey, queryFn, {
    staleTime: 2 * 60 * 1000, // 2 minutes for formulas
    cacheTime: 10 * 60 * 1000, // 10 minutes cache
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    ...options,
  });
};

// Hook for real-time sensitive data
export const useRealTimeQuery = <T>(
  queryKey: QueryKey,
  queryFn: () => Promise<T>,
  options: OptimizedQueryOptions<T> = {}
) => {
  return useOptimizedQuery(queryKey, queryFn, {
    staleTime: 0, // Always fresh
    cacheTime: 30 * 1000, // 30 seconds cache
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchInterval: 30000, // Refetch every 30 seconds
    ...options,
  });
};