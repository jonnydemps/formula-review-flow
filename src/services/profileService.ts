
import { User, UserRole } from '@/types/auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Admin email addresses - use your own email here to gain admin access
const ADMIN_EMAILS = ['john-dempsey@hotmail.co.uk'];

export const fetchUserProfile = async (authUser: any): Promise<User> => {
  console.log('Fetching profile for user:', authUser.id);
  
  try {
    // Check if user should have admin role based on email
    if (ADMIN_EMAILS.includes(authUser.email)) {
      console.log('Admin email detected, assigning admin role');
      return {
        id: authUser.id,
        email: authUser.email || '',
        role: 'admin' as UserRole,
        name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'Admin'
      };
    }

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
      // Determine role from user metadata if available, otherwise default to customer
      const defaultRole: UserRole = authUser.user_metadata?.role as UserRole || 'customer';
      
      try {
        const { error: insertError } = await supabase
          .from('profiles')
          .upsert({
            id: authUser.id,
            name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
            role: defaultRole
          });

        if (insertError) {
          console.error('Error creating profile:', insertError);
          console.log('Returning default user profile due to permission error');
          return {
            id: authUser.id,
            email: authUser.email || '',
            role: defaultRole,
            name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User'
          };
        }

        // Refetch the newly created profile
        const { data: newProfileData, error: newProfileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .single();

        if (newProfileError) {
          console.error('Error fetching new profile:', newProfileError);
          // Return a default user object if we can't fetch the profile
          return {
            id: authUser.id,
            email: authUser.email || '',
            role: defaultRole,
            name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User'
          };
        }

        console.log('Created and retrieved new profile:', newProfileData);
        return {
          id: authUser.id,
          email: authUser.email || '',
          role: newProfileData.role as UserRole,
          name: newProfileData.name
        };
      } catch (insertError) {
        console.error('Profile creation exception:', insertError);
        console.log('Returning default user profile due to permission error');
        // Return a default user object if profile creation fails
        return {
          id: authUser.id,
          email: authUser.email || '',
          role: defaultRole,
          name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User'
        };
      }
    }

    console.log('Retrieved existing profile:', profileData);
    return {
      id: authUser.id,
      email: authUser.email || '',
      role: profileData.role as UserRole,
      name: profileData.name
    };
  } catch (error) {
    console.error('Profile service error:', error);
    
    // Special case for admin emails
    if (ADMIN_EMAILS.includes(authUser.email)) {
      console.log('Admin email detected during error recovery, assigning admin role');
      return {
        id: authUser.id,
        email: authUser.email || '',
        role: 'admin' as UserRole,
        name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'Admin'
      };
    }
    
    // As a fallback, return a default user with customer role
    return {
      id: authUser.id,
      email: authUser.email || '',
      role: 'customer' as UserRole,
      name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User'
    };
  }
};
