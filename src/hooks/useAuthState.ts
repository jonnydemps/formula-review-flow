
import { useState, useEffect, useRef } from 'react';
import { User } from '@/types/auth';
import { supabase } from '@/integrations/supabase/client';
import { handleProfileFetchWithRetry } from '@/utils/profileFetcher';
import { clearProfileCache } from '@/utils/profileCache';

export const useAuthState = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const authChangeHandled = useRef(false);
  const sessionCheckComplete = useRef(false);

  useEffect(() => {
    console.log('Setting up auth listener...');
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);
      
      // Skip duplicate INITIAL_SESSION events if we've already handled one
      if (event === 'INITIAL_SESSION') {
        if (authChangeHandled.current) {
          console.log('Skipping duplicate INITIAL_SESSION event');
          return;
        }
        authChangeHandled.current = true;
      }

      if (event === 'SIGNED_IN' && session?.user) {
        setIsLoading(true);
        try {
          const userData = await handleProfileFetchWithRetry(session.user);
          if (userData) {
            setUser(userData);
          }
        } catch (error) {
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
        authChangeHandled.current = false;
        sessionCheckComplete.current = false;
      } else if (event === 'INITIAL_SESSION') {
        console.log('Initial session event');
        if (!session?.user) {
           setIsLoading(false);
           sessionCheckComplete.current = true;
        }
      }
    });

    // Check for existing session on initial load
    const checkSession = async () => {
      if (sessionCheckComplete.current) return;
      
      try {
        console.log('Checking for existing session');
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Session check error:', error);
          setIsLoading(false);
          sessionCheckComplete.current = true;
          return;
        }

        if (!session) {
          console.log('No active session found');
          setIsLoading(false);
          sessionCheckComplete.current = true;
          return;
        }

        console.log('Existing session found for user:', session.user.id);
        try {
          const userData = await handleProfileFetchWithRetry(session.user);
          if (userData) {
            setUser(userData);
          }
        } catch (error) {
          await supabase.auth.signOut();
        } finally {
          setIsLoading(false);
          sessionCheckComplete.current = true;
        }
      } catch (error) {
        console.error('Session check exception:', error);
        setIsLoading(false);
        sessionCheckComplete.current = true;
      }
    };

    checkSession();

    return () => {
      console.log('Cleaning up auth subscription');
      subscription.unsubscribe();
    };
  }, []);

  return { user, isLoading, setUser, setIsLoading };
};
