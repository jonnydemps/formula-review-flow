
import { supabase } from '@/integrations/supabase/client';
import { User, UserRole } from '@/types/auth';
import { toast } from 'sonner';

export const signIn = async (email: string, password: string) => {
  try {
    console.log('Attempting sign in for:', email);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;

    console.log('Sign in successful:', data.user?.id);
    toast.success('Successfully signed in');
    return data;
  } catch (error: any) {
    console.error('Sign in error:', error);
    toast.error(error.message || 'Failed to sign in');
    throw error;
  }
};

export const signUp = async (email: string, password: string, role: UserRole, name: string) => {
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
    
    return authData;
  } catch (error: any) {
    console.error('Sign up error:', error);
    
    if (error.message?.includes('already registered')) {
      toast.error('This email is already registered. Please sign in instead.');
    } else {
      toast.error('Failed to create account. Please try again.');
    }
    throw error;
  }
};

export const signOut = async () => {
  try {
    await supabase.auth.signOut();
    toast.success('Signed out successfully');
  } catch (error) {
    console.error('Sign out error:', error);
    toast.error('Failed to sign out');
    throw error;
  }
};
