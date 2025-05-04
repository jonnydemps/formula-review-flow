
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { User, AuthContextType, UserRole } from '@/types/auth';
import { fetchUserProfile } from '@/services/profileService';
import { navigateBasedOnRole } from '@/utils/navigationUtils';
import { signIn, signUp, signOut } from '@/services/authService';
import { toast } from 'sonner';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Initialize auth listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      // console.log('Auth state changed:', event, session?.user?.id);

      if (event === 'SIGNED_IN' && session?.user) {
        setIsLoading(true);
        try {
          // Fetch user profile (which now handles role determination)
          const userData = await fetchUserProfile(session.user);
          setUser(userData);
          // console.log('User profile fetched:', userData);

          // Use setTimeout to prevent potential state update issues during render
          setTimeout(() => {
            navigateBasedOnRole(navigate, userData);
            setIsLoading(false);
          }, 0);
        } catch (error: any) {
          console.error('Error fetching user profile on SIGNED_IN:', error);
          toast.error(`Failed to load user profile: ${error.message}. Signing out.`);
          // If profile fetch fails critically, sign the user out
          await supabase.auth.signOut();
          setUser(null);
          setIsLoading(false);
          navigate('/'); // Redirect to home after sign out
        }
      } else if (event === 'SIGNED_OUT') {
        // console.log('User signed out');
        setUser(null);
        navigate('/'); // Redirect to home page on sign out
        setIsLoading(false);
      } else if (event === 'INITIAL_SESSION') {
        // Handle initial session load if needed, or rely on checkSession
        // console.log('Initial session event');
        if (!session?.user) {
           setIsLoading(false); // No user, stop loading
        }
        // If session?.user exists, the checkSession function will handle it
      } else {
        // Handle other events like TOKEN_REFRESHED, USER_UPDATED if necessary
        // console.log('Other auth event:', event);
        // If user data might have changed, consider re-fetching profile
        if (event === 'USER_UPDATED' && session?.user && user) {
            try {
                const updatedUserData = await fetchUserProfile(session.user);
                setUser(updatedUserData);
            } catch (error) {
                console.error('Error re-fetching profile on USER_UPDATED:', error);
                // Decide how to handle this - maybe notify user?
            }
        }
      }
    });

    // Check for existing session on initial load
    const checkSession = async () => {
      try {
        // console.log('Checking for existing session');
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Session check error:', error);
          setIsLoading(false);
          return;
        }

        if (!session) {
          // console.log('No active session found');
          setIsLoading(false);
          return;
        }

        // console.log('Existing session found for user:', session.user.id);
        // Fetch profile for the existing session user
        try {
          const userData = await fetchUserProfile(session.user);
          setUser(userData);
          // console.log('User profile fetched for existing session:', userData);
          // Don't navigate here automatically, let components decide or use initial route
        } catch (profileError: any) {
          console.error('Profile fetch error during session check:', profileError);
          toast.error(`Failed to load profile for session: ${profileError.message}. Signing out.`);
          await supabase.auth.signOut();
          setUser(null);
        }
      } catch (error) {
        console.error('Session check exception:', error);
      } finally {
        // Ensure loading is set to false after session check completes or fails
        // Use a small delay to avoid flicker if SIGNED_IN event follows immediately
        setTimeout(() => setIsLoading(false), 50);
      }
    };

    // Run session check
    checkSession();

    // Cleanup subscription on component unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, user]); // Added user to dependency array for USER_UPDATED re-fetch logic

  const handleSignIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // console.log('Attempting sign in for:', email);
      await signIn(email, password);
      // Auth listener will handle setting user state and navigation
    } catch (error) {
      console.error('Sign in handler error:', error);
      // Error toast is handled within signIn service
      setIsLoading(false); // Ensure loading stops on error
    }
    // setIsLoading(false) // Removed from here, handled by auth listener or error case
  };

  const handleSignUp = async (email: string, password: string, role: UserRole, name: string) => {
    setIsLoading(true);
    try {
      await signUp(email, password, role, name);
      toast.success('Account created successfully! Please check your email to verify your account.');
      navigate('/sign-in'); // Redirect to sign-in after successful sign-up request
    } catch (error) {
      console.error('Sign up handler error:', error);
      // Error toast is handled within signUp service
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      // console.log('User signing out');
      await signOut();
      // Auth listener handles state update and navigation
    } catch (error) {
      console.error('Sign out handler error:', error);
      // Error toast is handled within signOut service
      // Force clear user state and navigate on error as a fallback
      setUser(null);
      navigate('/');
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      signIn: handleSignIn,
      signUp: handleSignUp,
      signOut: handleSignOut
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

