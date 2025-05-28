
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
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;

    // Determine the role
    const role = getDefaultRole(email);
    
    // Since this is a success case, we need to adapt the Supabase response to match our SignInSuccess type
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
    
    showSuccessToast('Account created successfully');
    
    return authData;
  } catch (error: any) {
    console.error('Sign up error:', error);
    
    // More user-friendly error messages
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
    await supabase.auth.signOut();
    showSuccessToast('Signed out successfully');
  } catch (error) {
    console.error('Sign out error:', error);
    showErrorToast(error, 'Sign Out Failed');
    throw error;
  }
};
