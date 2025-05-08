
import { supabase } from '@/integrations/supabase/client';
import { User, UserRole } from '@/types/auth';
import { toast } from 'sonner';
import { Session } from '@supabase/supabase-js';

// Define the success response type
export interface SignInSuccess {
  data: {
    user: User;
    session: Session;
  };
}

// Define the error response type
export interface SignInError {
  error: {
    message: string;
  };
}

// Union type for the sign-in response
export type SignInResponse = SignInSuccess | SignInError;

export const signIn = async (email: string, password: string): Promise<SignInResponse> => {
  try {
    console.log('Attempting sign in for:', email);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;

    // Since this is a success case, we need to adapt the Supabase response to match our SignInSuccess type
    const userData: User = {
      id: data.user?.id || '',
      email: data.user?.email || '',
      name: data.user?.user_metadata?.name || '',
      role: (data.user?.user_metadata?.role as UserRole) || 'customer'
    };

    console.log('Sign in successful:', userData.id);
    toast.success('Successfully signed in');
    return { 
      data: {
        user: userData,
        session: data.session
      } 
    };
  } catch (error: any) {
    console.error('Sign in error:', error);
    
    // More user-friendly error messages
    if (error.message?.includes('Invalid login credentials')) {
      toast.error('Invalid email or password. Please try again.');
    } else if (error.message?.includes('Email not confirmed')) {
      toast.error('Please confirm your email before signing in.');
    } else if (error.message?.includes('Invalid API key')) {
      toast.error('Authentication service configuration error. Please contact support.');
    } else {
      toast.error(error.message || 'Failed to sign in');
    }
    
    return { error: { message: error.message || 'Failed to sign in' } };
  }
};

export const signUp = async (email: string, password: string, role: UserRole, name: string) => {
  try {
    console.log('Starting signup process for:', email, 'with role:', role);
    
    // First, create the auth user with metadata
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name, // Store name in user metadata for easier recovery if needed
          role: role  // Store role in metadata as backup
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

    // Then create the user profile with role information - but don't worry if it fails
    // We'll create it on first successful login
    try {
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
        console.log('Profile creation error:', profileError);
        // Don't throw here, we'll continue with the signup process
      } else {
        console.log('Profile created successfully for role:', role);
      }
    } catch (profileError) {
      console.error('Profile creation exception:', profileError);
      // Continue with the process, don't block signup
    }
    
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
