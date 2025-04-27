
import { User, UserRole } from '@/types/auth';
import { supabase } from '@/integrations/supabase/client';

export const fetchUserProfile = async (authUser: any): Promise<User> => {
  console.log('Fetching profile for user:', authUser.id);
  
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
      const defaultRole: UserRole = 'customer';
      
      // Try using service_role client if available, otherwise use regular client
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: authUser.id,
          name: authUser.email?.split('@')[0] || 'User', // Use email username as default name
          role: defaultRole
        });

      if (insertError) {
        console.error('Error creating profile:', insertError);
        
        // If we get a permission error, return a default user object
        // This allows the app to continue working even if profile creation fails
        console.log('Returning default user profile due to permission error');
        return {
          id: authUser.id,
          email: authUser.email || '',
          role: defaultRole,
          name: authUser.email?.split('@')[0] || 'User'
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
        // Again, return a default user object if we can't fetch the profile
        return {
          id: authUser.id,
          email: authUser.email || '',
          role: defaultRole,
          name: authUser.email?.split('@')[0] || 'User'
        };
      }

      console.log('Created and retrieved new profile:', newProfileData);
      return {
        id: authUser.id,
        email: authUser.email || '',
        role: newProfileData.role as UserRole,
        name: newProfileData.name
      };
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
    // As a fallback, return a default user with customer role
    // This prevents the app from crashing if profile operations fail
    return {
      id: authUser.id,
      email: authUser.email || '',
      role: 'customer' as UserRole,
      name: authUser.email?.split('@')[0] || 'User'
    };
  }
};
