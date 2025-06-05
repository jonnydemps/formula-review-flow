
import { useState, useEffect, useCallback } from 'react';
import { User } from '@/types/auth';
import { useAuthSubscription } from './useAuthSubscription';

export const useAuthState = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const setUserCallback = useCallback((userData: User | null) => {
    console.log('Setting user:', userData?.email, 'role:', userData?.role);
    setUser(userData);
  }, []);

  const setLoadingCallback = useCallback((loading: boolean) => {
    console.log('Setting loading state:', loading);
    setIsLoading(loading);
  }, []);

  const { mountedRef, initializeAuth, cleanup } = useAuthSubscription({
    setUser: setUserCallback,
    setLoading: setLoadingCallback
  });

  useEffect(() => {
    mountedRef.current = true;
    initializeAuth();
    
    return () => {
      mountedRef.current = false;
      cleanup();
    };
  }, [initializeAuth, cleanup]);

  return { 
    user, 
    isLoading, 
    setUser: setUserCallback, 
    setIsLoading: setLoadingCallback 
  };
};
