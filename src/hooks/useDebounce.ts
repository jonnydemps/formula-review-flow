import { useState, useEffect, useCallback, useMemo } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
  deps: React.DependencyList = []
): (...args: Parameters<T>) => void {
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }

      const newTimer = setTimeout(() => {
        callback(...args);
      }, delay);

      setDebounceTimer(newTimer);
    },
    [callback, delay, debounceTimer, ...deps]
  );

  useEffect(() => {
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [debounceTimer]);

  return debouncedCallback;
}

export function useDebouncedState<T>(
  initialValue: T,
  delay: number
): [T, T, (value: T) => void] {
  const [immediateValue, setImmediateValue] = useState<T>(initialValue);
  const debouncedValue = useDebounce(immediateValue, delay);

  const setValue = useCallback((value: T) => {
    setImmediateValue(value);
  }, []);

  return [immediateValue, debouncedValue, setValue];
}

// Hook for search functionality with debouncing
export function useDebouncedSearch(
  searchFunction: (query: string) => Promise<any>,
  delay: number = 300
) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debouncedQuery = useDebounce(query, delay);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      setIsLoading(false);
      setError(null);
      return;
    }

    const performSearch = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const searchResults = await searchFunction(debouncedQuery);
        setResults(searchResults);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Search failed');
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    performSearch();
  }, [debouncedQuery, searchFunction]);

  const clearSearch = useCallback(() => {
    setQuery('');
    setResults([]);
    setError(null);
  }, []);

  return {
    query,
    setQuery,
    results,
    isLoading,
    error,
    clearSearch,
  };
}