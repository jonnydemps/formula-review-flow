
import { useState, useEffect, useRef, useCallback } from 'react';
import { User } from '@/types/auth';
import { supabase } from '@/integrations/supabase/client';
import { handleProfileFetchWithRetry } from '@/utils/profileFetcher';
import { clearProfileCache } from '@/utils/profileCache';

export const useAuthState = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const initializationRef = useRef(false);
  const subscriptionRef = useRef<any>(null);
  const cleanupRef = useRef(false);

  // Memoize setUser to prevent unnecessary re-renders
  const setUserCallback = useCallback((userData: User | null) => {
    setUser(userData);
  }, []);

  // Memoize setIsLoading to prevent unnecessary re-renders
  const setIsLoadingCallback = useCallback((loading: boolean) => {
    setIsLoading(loading);
  }, []);

  useEffect(() => {
    // Prevent multiple initializations
    if (initializationRef.current || cleanupRef.current) {
      console.log('Auth already initialized or cleaning up, skipping...');
      return;
    }
    
    initializationRef.current = true;
    console.log('Setting up auth listener (single initialization)...');
    
    const setupAuth = async () => {
      try {
        // Set up auth state listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
          console.log('Auth state changed:', event, session?.user?.id);
          
          if (event === 'SIGNED_IN' && session?.user) {
            setIsLoadingCallback(true);
            try {
              const userData = await handleProfileFetchWithRetry(session.user);
              if (userData && !cleanupRef.current) {
                console.log('User profile fetched successfully:', userData);
                setUserCallback(userData);
              }
            } catch (error) {
              console.error('Profile fetch failed, signing out:', error);
              if (!cleanupRef.current) {
                await supabase.auth.signOut();
                setUserCallback(null);
              }
            } finally {
              if (!cleanupRef.current) {
                setIsLoadingCallback(false);
              }
            }
          } else if (event === 'SIGNED_OUT') {
            console.log('User signed out');
            if (!cleanupRef.current) {
              setUserCallback(null);
              clearProfileCache();
              setIsLoadingCallback(false);
            }
          } else if (event === 'INITIAL_SESSION') {
            console.log('Initial session event');
            if (!session?.user && !cleanupRef.current) {
              setIsLoadingCallback(false);
            }
          }
        });

        subscriptionRef.current = subscription;

        // Check for existing session
        console.log('Checking for existing session');
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Session check error:', error);
          if (!cleanupRef.current) {
            setIsLoadingCallback(false);
          }
          return;
        }

        if (!session) {
          console.log('No active session found');
          if (!cleanupRef.current) {
            setIsLoadingCallback(false);
          }
          return;
        }

        console.log('Existing session found for user:', session.user.id);
        try {
          const userData = await handleProfileFetchWithRetry(session.user);
          if (userData && !cleanupRef.current) {
            console.log('Initial session profile loaded:', userData);
            setUserCallback(userData);
          }
        } catch (error) {
          console.error('Initial session profile fetch failed:', error);
          if (!cleanupRef.current) {
            await supabase.auth.signOut();
          }
        } finally {
          if (!cleanupRef.current) {
            setIsLoadingCallback(false);
          }
        }
      } catch (error) {
        console.error('Auth setup error:', error);
        if (!cleanupRef.current) {
          setIsLoadingCallback(false);
        }
      }
    };

    setupAuth();

    return () => {
      console.log('Cleaning up auth subscription');
      cleanupRef.current = true;
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
    };
  }, []); // Empty dependency array to ensure this only runs once

  return { 
    user, 
    isLoading, 
    setUser: setUserCallback, 
    setIsLoading: setIsLoadingCallback 
  };
};
