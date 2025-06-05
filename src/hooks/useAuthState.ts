
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
      setUser(userData);
    }
  }, []);

  const setLoadingCallback = useCallback((loading: boolean) => {
    if (mountedRef.current) {
      setIsLoading(loading);
    }
  }, []);

  // Helper function to handle profile fetch with timeout
  const handleProfileFetchWithTimeout = async (authUser: any): Promise<User | null> => {
    return new Promise(async (resolve) => {
      // Set a timeout to prevent hanging
      const timeout = setTimeout(() => {
        console.log('Profile fetch timeout, proceeding without profile');
        resolve(null);
      }, 10000); // 10 second timeout

      try {
        const userData = await handleProfileFetchWithRetry(authUser);
        clearTimeout(timeout);
        resolve(userData);
      } catch (error) {
        console.error('Profile fetch failed:', error);
        clearTimeout(timeout);
        resolve(null);
      }
    });
  };

  useEffect(() => {
    mountedRef.current = true;
    
    // If auth is already initialized, just get current state
    if (isAuthInitialized && globalAuthSubscription) {
      console.log('Auth already initialized, getting current session...');
      
      supabase.auth.getSession().then(async ({ data: { session }, error }) => {
        if (error) {
          console.error('Session check error:', error);
          if (mountedRef.current) {
            setLoadingCallback(false);
          }
          return;
        }

        if (session?.user && mountedRef.current) {
          try {
            const userData = await handleProfileFetchWithTimeout(session.user);
            if (userData && mountedRef.current) {
              setUserCallback(userData);
            } else if (mountedRef.current) {
              // If profile fetch failed but we have a session, sign out
              await supabase.auth.signOut();
              setUserCallback(null);
            }
          } catch (error) {
            console.error('Profile fetch failed:', error);
            if (mountedRef.current) {
              await supabase.auth.signOut();
              setUserCallback(null);
            }
          }
        }
        
        if (mountedRef.current) {
          setLoadingCallback(false);
        }
      });
      
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
              
              try {
                const userData = await handleProfileFetchWithTimeout(session.user);
                if (userData && mountedRef.current) {
                  console.log('User profile loaded:', userData.email);
                  setUserCallback(userData);
                } else if (mountedRef.current) {
                  console.log('Profile fetch failed, signing out');
                  await supabase.auth.signOut();
                  setUserCallback(null);
                }
              } catch (error) {
                console.error('Profile fetch failed, signing out:', error);
                if (mountedRef.current) {
                  await supabase.auth.signOut();
                  setUserCallback(null);
                }
              } finally {
                if (mountedRef.current) {
                  setLoadingCallback(false);
                }
              }
            } else if (event === 'SIGNED_OUT') {
              console.log('User signed out');
              if (mountedRef.current) {
                setUserCallback(null);
                clearProfileCache();
                setLoadingCallback(false);
              }
            } else if (event === 'INITIAL_SESSION') {
              console.log('Initial session event');
              if (!session?.user && mountedRef.current) {
                setLoadingCallback(false);
              }
            }
          });

          globalAuthSubscription = subscription;

          // Check for existing session with timeout
          console.log('Checking for existing session...');
          
          // Add timeout for session check
          const sessionTimeout = setTimeout(() => {
            console.log('Session check timeout, clearing loading state');
            if (mountedRef.current) {
              setLoadingCallback(false);
            }
          }, 8000); // 8 second timeout for session check

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
          try {
            const userData = await handleProfileFetchWithTimeout(session.user);
            if (userData && mountedRef.current) {
              console.log('Initial profile loaded:', userData.email);
              setUserCallback(userData);
            } else if (mountedRef.current) {
              console.log('Initial profile fetch failed, signing out');
              await supabase.auth.signOut();
              setUserCallback(null);
            }
          } catch (error) {
            console.error('Initial profile fetch failed:', error);
            if (mountedRef.current) {
              await supabase.auth.signOut();
              setUserCallback(null);
            }
          } finally {
            if (mountedRef.current) {
              setLoadingCallback(false);
            }
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

  // Cleanup on app unmount (this won't run in normal component unmount)
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
