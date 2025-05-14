import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { User, AuthContextType, UserRole } from '@/types/auth';
import { fetchUserProfile } from '@/services/profileService';
import { navigateBasedOnRole } from '@/utils/navigationUtils';
import { signIn, signUp, signOut, SignInResponse } from '@/services/authService';
import { toast } from 'sonner';

// Create the context with a default undefined value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const initialSessionChecked = useRef(false);
  const authChangeHandled = useRef(false);
  const profileFetchTimeout = useRef<NodeJS.Timeout | null>(null);
  const sessionCheckComplete = useRef(false);

  // Function to handle profile fetch with timeout and retries
  const handleProfileFetch = async (sessionUser: any, retryCount = 0) => {
    // Clear any existing timeout
    if (profileFetchTimeout.current) {
      clearTimeout(profileFetchTimeout.current);
      profileFetchTimeout.current = null;
    }

    try {
      console.log(`Fetching user profile (attempt ${retryCount + 1})...`);
      const userData = await fetchUserProfile(sessionUser);
      setUser(userData);
      console.log('User profile fetched successfully:', userData);
      
      // Don't navigate on profile fetch if we're just initializing
      // Let the component's own protection handle navigation
      setIsLoading(false);
      
      return true;
    } catch (error: any) {
      console.error(`Error fetching user profile (attempt ${retryCount + 1}):`, error);
      
      // If we haven't retried too many times, try again
      if (retryCount < 2) {
        console.log(`Retrying profile fetch in 1 second...`);
        profileFetchTimeout.current = setTimeout(() => {
          handleProfileFetch(sessionUser, retryCount + 1);
        }, 1000);
        return false;
      }
      
      // After max retries, show error and sign out
      toast.error(`Failed to load user profile. Please try logging in again.`);
      await supabase.auth.signOut();
      setUser(null);
      setIsLoading(false);
      navigate('/sign-in');
      return false;
    }
  };

  useEffect(() => {
    // Initialize auth listener
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
        handleProfileFetch(session.user);
      } else if (event === 'SIGNED_OUT') {
        console.log('User signed out');
        setUser(null);
        navigate('/'); // Redirect to home page on sign out
        setIsLoading(false);
        // Reset the flag on sign out so we can handle future sign-ins
        authChangeHandled.current = false;
        sessionCheckComplete.current = false;
      } else if (event === 'INITIAL_SESSION') {
        // Handle initial session load if needed, or rely on checkSession
        console.log('Initial session event');
        if (!session?.user) {
           setIsLoading(false); // No user, stop loading
           sessionCheckComplete.current = true;
        }
      }
    });

    // Check for existing session on initial load, but only once
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
        // Fetch profile for the existing session user
        await handleProfileFetch(session.user);
        sessionCheckComplete.current = true;
      } catch (error) {
        console.error('Session check exception:', error);
        setIsLoading(false);
        sessionCheckComplete.current = true;
      }
    };

    // Run session check
    checkSession();

    // Cleanup subscription on component unmount
    return () => {
      console.log('Cleaning up auth subscription');
      if (profileFetchTimeout.current) {
        clearTimeout(profileFetchTimeout.current);
      }
      subscription.unsubscribe();
    };
  }, []); // Removed navigate from dependency array to prevent re-fetching on navigation

  const handleSignIn = async (email: string, password: string): Promise<SignInResponse> => {
    setIsLoading(true);
    try {
      console.log('Attempting sign in for:', email);
      const result = await signIn(email, password);
      // Auth listener will handle setting user state
      console.log('Sign in success, waiting for auth context update');
      return result;
    } catch (error) {
      console.error('Sign in handler error:', error);
      setIsLoading(false); // Ensure loading stops on error
      throw error;
    }
  };

  const handleSignUp = async (email: string, password: string, role: UserRole, name: string) => {
    setIsLoading(true);
    try {
      await signUp(email, password, role, name);
      toast.success('Account created successfully! Please check your email to verify your account.');
      navigate('/sign-in'); // Redirect to sign-in after successful sign-up request
    } catch (error: any) {
      console.error('Sign up handler error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      console.log('User signing out');
      await signOut();
      // Auth listener handles state update and navigation
    } catch (error) {
      console.error('Sign out handler error:', error);
      // Force clear user state and navigate on error as a fallback
      setUser(null);
      navigate('/');
    }
  };

  // Create the context value object with all auth-related state and functions
  const contextValue: AuthContextType = {
    user,
    isLoading,
    signIn: handleSignIn,
    signUp: handleSignUp,
    signOut: handleSignOut
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Export the useAuth hook with proper error handling
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};
