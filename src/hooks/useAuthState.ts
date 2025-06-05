
import { useState, useEffect, useRef, useCallback } from 'react';
import { User } from '@/types/auth';
import { supabase } from '@/integrations/supabase/client';
import { handleProfileFetchWithRetry } from '@/utils/profileFetcher';
import { clearProfileCache } from '@/utils/profileCache';

// Global state to prevent multiple initializations
let isAuthInitialized = false;
let globalAuthSubscription: any = null;

export const useAuthState = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const mountedRef = useRef(true);

  // Stable callbacks to prevent unnecessary re-renders
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

  // Improved profile fetch with better timeout and error handling
  const handleProfileFetchWithTimeout = async (authUser: any): Promise<User | null> => {
    return new Promise(async (resolve) => {
      const timeout = setTimeout(() => {
        console.log('Profile fetch timeout after 8 seconds, proceeding without profile');
        resolve(null);
      }, 8000); // Reduced to 8 seconds for faster response

      try {
        console.log('Starting profile fetch for user:', authUser.id);
        const userData = await handleProfileFetchWithRetry(authUser, 0, 1); // Reduced retries
        clearTimeout(timeout);
        console.log('Profile fetch completed successfully');
        resolve(userData);
      } catch (error) {
        console.error('Profile fetch failed:', error);
        clearTimeout(timeout);
        resolve(null);
      }
    });
  };

  // Improved sign out handler
  const handleSignOut = async () => {
    try {
      console.log('Signing out user due to profile fetch failure');
      await supabase.auth.signOut();
      if (mountedRef.current) {
        setUserCallback(null);
        clearProfileCache();
      }
    } catch (error) {
      console.error('Error during sign out:', error);
      // Still clear user state even if sign out fails
      if (mountedRef.current) {
        setUserCallback(null);
        clearProfileCache();
      }
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
            const userData = await handleProfileFetchWithTimeout(session.user);
            if (userData && mountedRef.current) {
              setUserCallback(userData);
            } else if (mountedRef.current) {
              await handleSignOut();
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
          // Set up auth state listener with improved handling
          const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log('Auth state changed:', event, session?.user?.id);
            
            if (event === 'SIGNED_IN' && session?.user) {
              if (mountedRef.current) {
                setLoadingCallback(true);
              }
              
              const userData = await handleProfileFetchWithTimeout(session.user);
              if (userData && mountedRef.current) {
                console.log('User profile loaded successfully:', userData.email);
                setUserCallback(userData);
              } else if (mountedRef.current) {
                console.log('Profile fetch failed, signing out');
                await handleSignOut();
              }
              
              if (mountedRef.current) {
                setLoadingCallback(false);
              }
            } else if (event === 'SIGNED_OUT') {
              console.log('User signed out');
              if (mountedRef.current) {
                setUserCallback(null);
                clearProfileCache();
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

          // Check for existing session with improved timeout
          console.log('Checking for existing session...');
          
          const sessionTimeout = setTimeout(() => {
            console.log('Session check timeout, clearing loading state');
            if (mountedRef.current) {
              setLoadingCallback(false);
            }
          }, 6000); // Reduced to 6 seconds

          const { data: { session }, error } = await supabase.auth.getSession();
          clearTimeout(sessionTimeout);

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
          const userData = await handleProfileFetchWithTimeout(session.user);
          if (userData && mountedRef.current) {
            console.log('Initial profile loaded:', userData.email);
            setUserCallback(userData);
          } else if (mountedRef.current) {
            console.log('Initial profile fetch failed, signing out');
            await handleSignOut();
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
  }, []); // Empty dependency array ensures this runs only once

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
