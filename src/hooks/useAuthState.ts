
import { useState, useEffect, useRef, useCallback } from 'react';
import { User } from '@/types/auth';
import { supabase } from '@/integrations/supabase/client';
import { fetchUserProfile } from '@/services/profileService';

// Global state to prevent multiple initializations
let isAuthInitialized = false;
let globalAuthSubscription: any = null;

export const useAuthState = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const mountedRef = useRef(true);

  const setUserCallback = useCallback((userData: User | null) => {
    if (mountedRef.current) {
      console.log('Setting user:', userData?.email, 'role:', userData?.role);
      setUser(userData);
    }
  }, []);

  const setLoadingCallback = useCallback((loading: boolean) => {
    if (mountedRef.current) {
      console.log('Setting loading state:', loading);
      setIsLoading(loading);
    }
  }, []);

  // Simplified profile fetch with better error handling
  const handleProfileFetch = async (authUser: any): Promise<User | null> => {
    try {
      console.log('Fetching profile for user:', authUser.id);
      const userData = await fetchUserProfile(authUser);
      console.log('Profile fetched successfully:', userData);
      return userData;
    } catch (error) {
      console.error('Profile fetch failed:', error);
      // Don't sign out on profile fetch failure - let user stay authenticated
      return null;
    }
  };

  useEffect(() => {
    mountedRef.current = true;
    
    // If auth is already initialized, just get current state
    if (isAuthInitialized && globalAuthSubscription) {
      console.log('Auth already initialized, getting current session...');
      
      const checkSession = async () => {
        try {
          const { data: { session }, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error('Session check error:', error);
            if (mountedRef.current) {
              setLoadingCallback(false);
            }
            return;
          }

          if (session?.user && mountedRef.current) {
            const userData = await handleProfileFetch(session.user);
            if (userData && mountedRef.current) {
              setUserCallback(userData);
            }
          }
          
          if (mountedRef.current) {
            setLoadingCallback(false);
          }
        } catch (error) {
          console.error('Error checking session:', error);
          if (mountedRef.current) {
            setLoadingCallback(false);
          }
        }
      };

      checkSession();
      
      return () => {
        mountedRef.current = false;
      };
    }

    // First time initialization
    if (!isAuthInitialized) {
      console.log('Initializing auth for the first time...');
      isAuthInitialized = true;
      
      const initializeAuth = async () => {
        try {
          // Set up auth state listener
          const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log('Auth state changed:', event, session?.user?.id);
            
            if (event === 'SIGNED_IN' && session?.user) {
              if (mountedRef.current) {
                setLoadingCallback(true);
              }
              
              const userData = await handleProfileFetch(session.user);
              if (userData && mountedRef.current) {
                console.log('User profile loaded successfully:', userData.email);
                setUserCallback(userData);
              }
              
              if (mountedRef.current) {
                setLoadingCallback(false);
              }
            } else if (event === 'SIGNED_OUT') {
              console.log('User signed out');
              if (mountedRef.current) {
                setUserCallback(null);
                setLoadingCallback(false);
              }
            } else if (event === 'INITIAL_SESSION') {
              console.log('Initial session event processed');
              if (!session?.user && mountedRef.current) {
                setLoadingCallback(false);
              }
            }
          });

          globalAuthSubscription = subscription;

          // Check for existing session
          console.log('Checking for existing session...');
          const { data: { session }, error } = await supabase.auth.getSession();

          if (error) {
            console.error('Session check error:', error);
            if (mountedRef.current) {
              setLoadingCallback(false);
            }
            return;
          }

          if (!session) {
            console.log('No active session found');
            if (mountedRef.current) {
              setLoadingCallback(false);
            }
            return;
          }

          console.log('Existing session found for user:', session.user.id);
          const userData = await handleProfileFetch(session.user);
          if (userData && mountedRef.current) {
            console.log('Initial profile loaded:', userData.email);
            setUserCallback(userData);
          }
          
          if (mountedRef.current) {
            setLoadingCallback(false);
          }
        } catch (error) {
          console.error('Auth initialization error:', error);
          if (mountedRef.current) {
            setLoadingCallback(false);
          }
        }
      };

      initializeAuth();
    }

    return () => {
      mountedRef.current = false;
    };
  }, [setUserCallback, setLoadingCallback]);

  // Cleanup on app unmount
  useEffect(() => {
    return () => {
      if (globalAuthSubscription) {
        console.log('Cleaning up global auth subscription');
        globalAuthSubscription.unsubscribe();
        globalAuthSubscription = null;
        isAuthInitialized = false;
      }
    };
  }, []);

  return { 
    user, 
    isLoading, 
    setUser: setUserCallback, 
    setIsLoading: setLoadingCallback 
  };
};
