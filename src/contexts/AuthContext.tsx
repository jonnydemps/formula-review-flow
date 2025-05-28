
import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { User, AuthContextType, UserRole } from '@/types/auth';
import { signIn, signUp, signOut, SignInResponse } from '@/services/authService';
import { handleProfileFetchWithRetry } from '@/utils/profileFetcher';
import { clearProfileCache } from '@/utils/profileCache';
import { toast } from 'sonner';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
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
          navigate('/sign-in');
        } finally {
          setIsLoading(false);
        }
      } else if (event === 'SIGNED_OUT') {
        console.log('User signed out');
        setUser(null);
        clearProfileCache();
        navigate('/');
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
  }, [navigate]);

  const handleSignIn = async (email: string, password: string): Promise<SignInResponse> => {
    setIsLoading(true);
    try {
      console.log('Attempting sign in for:', email);
      const result = await signIn(email, password);
      console.log('Sign in success, waiting for auth context update');
      return result;
    } catch (error) {
      console.error('Sign in handler error:', error);
      setIsLoading(false);
      throw error;
    }
  };

  const handleSignUp = async (email: string, password: string, role: UserRole, name: string) => {
    setIsLoading(true);
    try {
      await signUp(email, password, role, name);
      toast.success('Account created successfully! Please check your email to verify your account.');
      navigate('/sign-in');
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
    } catch (error) {
      console.error('Sign out handler error:', error);
      setUser(null);
      navigate('/');
    }
  };

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

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};
