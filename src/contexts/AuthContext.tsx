import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export type UserRole = 'customer' | 'specialist' | 'admin';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, role: UserRole, name: string) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);
      
      if (event === 'SIGNED_IN' && session?.user) {
        await fetchUserProfile(session.user);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        navigate('/');
      }
    });

    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await fetchUserProfile(session.user);
      }
      setIsLoading(false);
    };

    checkSession();

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const fetchUserProfile = async (authUser: any) => {
    try {
      // Use maybeSingle() to handle cases where no profile exists
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        throw profileError;
      }

      // If no profile exists, create one
      if (!profileData) {
        console.log('No profile found, creating a default profile');
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: authUser.id,
            name: authUser.email.split('@')[0], // Use email username as default name
            role: 'customer' // Default role
          });

        if (insertError) {
          console.error('Error creating profile:', insertError);
          throw insertError;
        }

        // Refetch the newly created profile
        const { data: newProfileData, error: newProfileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .single();

        if (newProfileError) {
          console.error('Error fetching new profile:', newProfileError);
          throw newProfileError;
        }

        const userData: User = {
          id: authUser.id,
          email: authUser.email || '',
          role: newProfileData.role as UserRole,
          name: newProfileData.name
        };

        setUser(userData);
        navigateBasedOnRole(userData);
        return;
      }

      const userData: User = {
        id: authUser.id,
        email: authUser.email || '',
        role: profileData.role as UserRole,
        name: profileData.name
      };

      setUser(userData);
      navigateBasedOnRole(userData);
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      toast.error('Failed to load user profile');
      await supabase.auth.signOut();
      setUser(null);
    }
  };

  const navigateBasedOnRole = (userData: User) => {
    switch (userData.role) {
      case 'admin':
        navigate('/admin-dashboard');
        break;
      case 'specialist':
        navigate('/specialist-dashboard');
        break;
      case 'customer':
        navigate('/customer-dashboard');
        break;
      default:
        navigate('/');
    }
  };

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
      
      if (data.user) {
        await fetchUserProfile(data.user);
      }
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
      
      // Step 1: Sign up the user with Supabase Auth
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

      // Step 2: Create the profile entry
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
        // If profile creation fails, clean up the auth user
        await supabase.auth.signOut();
        throw profileError;
      }
      
      console.log('Profile created successfully for role:', role);
      toast.success('Account created successfully');
      
      // Wait a moment for the database to update before signing in
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
