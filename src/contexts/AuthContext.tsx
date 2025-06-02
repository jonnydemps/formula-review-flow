
import React, { createContext, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { User, AuthContextType, UserRole } from '@/types/auth';
import { signIn, signUp, signOut, SignInResponse } from '@/services/authService';
import { useAuthState } from '@/hooks/useAuthState';
import { toast } from 'sonner';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading, setUser, setIsLoading } = useAuthState();
  const navigate = useNavigate();

  const handleSignIn = async (email: string, password: string): Promise<SignInResponse> => {
    console.log('Attempting sign in for:', email);
    try {
      const result = await signIn(email, password);
      console.log('Sign in success, waiting for auth context update');
      return result;
    } catch (error) {
      console.error('Sign in handler error:', error);
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
