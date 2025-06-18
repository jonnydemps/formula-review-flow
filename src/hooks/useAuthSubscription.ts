
import { useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types/auth';
import { fetchUserProfile } from '@/services/profileService';

interface UseAuthSubscriptionProps {
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthSubscription = ({ setUser, setLoading }: UseAuthSubscriptionProps) => {
  const mountedRef = useRef(true);
  const subscriptionRef = useRef<any>(null);

  const handleProfileFetch = useCallback(async (authUser: any): Promise<User | null> => {
    try {
      console.log('Fetching profile for user:', authUser.id);
      const userData = await fetchUserProfile(authUser);
      console.log('Profile fetched successfully:', userData);
      return userData;
    } catch (error) {
      console.error('Profile fetch failed:', error);
      return null;
    }
  }, []);

  const initializeAuth = useCallback(async () => {
    console.log('Initializing auth...');
    
    try {
      // Clean up any existing subscription first
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }

      // Set up auth state listener
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        
        if (!mountedRef.current) return;
        
        if (event === 'SIGNED_IN' && session?.user) {
          setLoading(true);
          
          const userData = await handleProfileFetch(session.user);
          if (userData && mountedRef.current) {
            console.log('User profile loaded successfully:', userData.email);
            setUser(userData);
          }
          
          if (mountedRef.current) setLoading(false);
        } else if (event === 'SIGNED_OUT') {
          console.log('User signed out');
          if (mountedRef.current) {
            setUser(null);
            setLoading(false);
          }
        } else if (event === 'INITIAL_SESSION') {
          console.log('Initial session event processed');
          if (!session?.user && mountedRef.current) {
            setLoading(false);
          }
        }
      });

      subscriptionRef.current = subscription;

      // Check for existing session
      console.log('Checking for existing session...');
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        console.error('Session check error:', error);
        if (mountedRef.current) setLoading(false);
        return;
      }

      if (!session) {
        console.log('No active session found');
        if (mountedRef.current) setLoading(false);
        return;
      }

      console.log('Existing session found for user:', session.user.id);
      const userData = await handleProfileFetch(session.user);
      if (userData && mountedRef.current) {
        console.log('Initial profile loaded:', userData.email);
        setUser(userData);
      }
      
      if (mountedRef.current) setLoading(false);
    } catch (error) {
      console.error('Auth initialization error:', error);
      if (mountedRef.current) setLoading(false);
    }
  }, [setUser, setLoading, handleProfileFetch]);

  const cleanup = useCallback(() => {
    if (subscriptionRef.current) {
      console.log('Cleaning up auth subscription');
      subscriptionRef.current.unsubscribe();
      subscriptionRef.current = null;
    }
  }, []);

  return {
    mountedRef,
    initializeAuth,
    cleanup
  };
};
