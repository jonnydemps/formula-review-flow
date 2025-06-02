
import { useState, useEffect, useRef } from 'react';
import { User } from '@/types/auth';
import { supabase } from '@/integrations/supabase/client';
import { handleProfileFetchWithRetry } from '@/utils/profileFetcher';
import { clearProfileCache } from '@/utils/profileCache';

export const useAuthState = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const initialCheckDone = useRef(false);
  const subscriptionRef = useRef<any>(null);

  useEffect(() => {
    // Prevent multiple initializations
    if (initialCheckDone.current) return;
    initialCheckDone.current = true;

    console.log('Setting up auth listener...');
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);
      
      if (event === 'SIGNED_IN' && session?.user) {
        setIsLoading(true);
        try {
          const userData = await handleProfileFetchWithRetry(session.user);
          if (userData) {
            console.log('User profile fetched successfully:', userData);
            setUser(userData);
          }
        } catch (error) {
          console.error('Profile fetch failed, signing out:', error);
          await supabase.auth.signOut();
          setUser(null);
        } finally {
          setIsLoading(false);
        }
      } else if (event === 'SIGNED_OUT') {
        console.log('User signed out');
        setUser(null);
        clearProfileCache();
        setIsLoading(false);
      } else if (event === 'INITIAL_SESSION') {
        console.log('Initial session event');
        if (!session?.user) {
          setIsLoading(false);
        }
      }
    });

    subscriptionRef.current = subscription;

    // Check for existing session on initial load
    const checkInitialSession = async () => {
      try {
        console.log('Checking for existing session');
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Session check error:', error);
          setIsLoading(false);
          return;
        }

        if (!session) {
          console.log('No active session found');
          setIsLoading(false);
          return;
        }

        console.log('Existing session found for user:', session.user.id);
        try {
          const userData = await handleProfileFetchWithRetry(session.user);
          if (userData) {
            console.log('Initial session profile loaded:', userData);
            setUser(userData);
          }
        } catch (error) {
          console.error('Initial session profile fetch failed:', error);
          await supabase.auth.signOut();
        } finally {
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Session check exception:', error);
        setIsLoading(false);
      }
    };

    checkInitialSession();

    return () => {
      console.log('Cleaning up auth subscription');
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
    };
  }, []); // Empty dependency array to ensure this only runs once

  return { user, isLoading, setUser, setIsLoading };
};
