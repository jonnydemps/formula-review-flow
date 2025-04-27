
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { User, UserRole, AuthContextType } from '@/types/auth';
import { fetchUserProfile } from '@/services/profileService';
import { navigateBasedOnRole } from '@/utils/navigationUtils';

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

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      console.log('Attempting sign in for:', email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      console.log('Sign in successful:', data.user?.id);
      toast.success('Successfully signed in');
    } catch (error: any) {
      console.error('Sign in error:', error);
      toast.error(error.message || 'Failed to sign in');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, role: UserRole, name: string) => {
    setIsLoading(true);
    try {
      console.log('Starting signup process for:', email, 'with role:', role);
      
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) {
        console.error('Auth signup error:', signUpError);
        throw signUpError;
      }
      
      if (!authData.user) {
        throw new Error('No user data returned after signup');
      }
      
      console.log('Auth signup successful, user ID:', authData.user.id);

      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: authData.user.id,
            name: name,
            role: role
          }
        ]);

      if (profileError) {
        console.error('Profile creation error:', profileError);
        await supabase.auth.signOut();
        throw profileError;
      }
      
      console.log('Profile created successfully for role:', role);
      toast.success('Account created successfully');
      
      setTimeout(async () => {
        try {
          await signIn(email, password);
        } catch (err) {
          console.error('Error during auto-signin after signup:', err);
        }
      }, 1000);
      
    } catch (error: any) {
      console.error('Sign up error:', error);
      
      if (error.message?.includes('already registered')) {
        toast.error('This email is already registered. Please sign in instead.');
      } else {
        toast.error('Failed to create account. Please try again.');
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      toast.success('Signed out successfully');
      navigate('/');
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('Failed to sign out');
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signUp, signOut }}>
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
