
import { supabase } from '@/integrations/supabase/client';
import { User, UserRole } from '@/types/auth';
import { getDefaultRole } from '@/utils/authUtils';
import { handleAuthError } from '@/utils/errorUtils';
import { showSuccessToast, showErrorToast } from '@/utils/toastUtils';
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
    
    // Clear any existing session first
    await supabase.auth.signOut();
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;

    // Determine the role
    const role = getDefaultRole(email);
    
    const userData: User = {
      id: data.user?.id || '',
      email: data.user?.email || '',
      name: data.user?.user_metadata?.name || '',
      role: role
    };

    console.log('Sign in successful:', userData.id);
    showSuccessToast('Successfully signed in');
    return { 
      data: {
        user: userData,
        session: data.session
      } 
    };
  } catch (error: any) {
    console.error('Sign in error:', error);
    
    const errorMessage = handleAuthError(error);
    showErrorToast(error, 'Sign In Failed');
    
    return { error: { message: errorMessage } };
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
          name: name,
          role: role
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

    // Create the user profile
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
      } else {
        console.log('Profile created successfully for role:', role);
      }
    } catch (profileError) {
      console.error('Profile creation exception:', profileError);
    }
    
    showSuccessToast('Account created successfully');
    
    return authData;
  } catch (error: any) {
    console.error('Sign up error:', error);
    
    if (error.message?.includes('already registered')) {
      showErrorToast('This email is already registered. Please sign in instead.', 'Registration Failed');
    } else if (error.message?.includes('password')) {
      showErrorToast('Password error: ' + error.message, 'Registration Failed');
    } else {
      showErrorToast(error, 'Registration Failed');
    }
    throw error;
  }
};

export const signOut = async () => {
  try {
    console.log('Signing out user...');
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Sign out error:', error);
      throw error;
    }
    console.log('Sign out successful');
    showSuccessToast('Signed out successfully');
  } catch (error) {
    console.error('Sign out error:', error);
    showErrorToast(error, 'Sign Out Failed');
    throw error;
  }
};
