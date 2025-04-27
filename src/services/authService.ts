
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
    
    // More user-friendly error messages
    if (error.message?.includes('Invalid login credentials')) {
      toast.error('Invalid email or password. Please try again.');
    } else if (error.message?.includes('Email not confirmed')) {
      toast.error('Please confirm your email before signing in.');
    } else {
      toast.error(error.message || 'Failed to sign in');
    }
    throw error;
  }
};

export const signUp = async (email: string, password: string, role: UserRole, name: string) => {
  try {
    console.log('Starting signup process for:', email, 'with role:', role);
    
    // First, create the auth user
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name // Store name in user metadata for easier recovery if needed
        }
      }
    });

    if (signUpError) {
      console.error('Auth signup error:', signUpError);
      throw signUpError;
    }
    
    if (!authData.user) {
      throw new Error('No user data returned after signup');
    }
    
    console.log('Auth signup successful, user ID:', authData.user.id);

    // Then create the user profile with role information
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
      // Attempt to rollback by signing out
      await supabase.auth.signOut();
      throw profileError;
    }
    
    console.log('Profile created successfully for role:', role);
    toast.success('Account created successfully');
    
    return authData;
  } catch (error: any) {
    console.error('Sign up error:', error);
    
    // More user-friendly error messages
    if (error.message?.includes('already registered')) {
      toast.error('This email is already registered. Please sign in instead.');
    } else if (error.message?.includes('password')) {
      toast.error('Password error: ' + error.message);
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
