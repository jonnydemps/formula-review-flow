
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
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);
      
      if (event === 'SIGNED_IN' && session?.user) {
        try {
          const userData = await fetchUserProfile(session.user);
          setUser(userData);
          navigateBasedOnRole(navigate, userData);
        } catch (error) {
          console.error('Error in fetchUserProfile:', error);
          toast.error('Failed to load user profile');
          await supabase.auth.signOut();
          setUser(null);
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        navigate('/');
      }
    });

    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        try {
          const userData = await fetchUserProfile(session.user);
          setUser(userData);
          navigateBasedOnRole(navigate, userData);
        } catch (error) {
          console.error('Error in checkSession:', error);
        }
      }
      setIsLoading(false);
    };

    checkSession();
    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const handleSignIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      await signIn(email, password);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (email: string, password: string, role: UserRole, name: string) => {
    setIsLoading(true);
    try {
      await signUp(email, password, role, name);
      
      setTimeout(async () => {
        try {
          await handleSignIn(email, password);
        } catch (err) {
          console.error('Error during auto-signin after signup:', err);
        }
      }, 1000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error in handleSignOut:', error);
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
