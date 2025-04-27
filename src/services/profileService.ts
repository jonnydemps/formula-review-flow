
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

    // Use maybeSingle() instead of single() to handle cases where profile might not exist
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
      
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: authUser.id,
          name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
          role: defaultRole
        });

      if (insertError) {
        console.error('Error creating profile:', insertError);
        // Return default profile instead of throwing
        return {
          id: authUser.id,
          email: authUser.email || '',
          role: defaultRole,
          name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User'
        };
      }

      return {
        id: authUser.id,
        email: authUser.email || '',
        role: defaultRole,
        name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User'
      };
    }

    return {
      id: authUser.id,
      email: authUser.email || '',
      role: profileData.role as UserRole,
      name: profileData.name || authUser.email?.split('@')[0] || 'User'
    };
  } catch (error: any) {
    console.error('Profile service error:', error);
    
    // Special case for admin emails during error recovery
    if (ADMIN_EMAILS.includes(authUser.email)) {
      return {
        id: authUser.id,
        email: authUser.email || '',
        role: 'admin' as UserRole,
        name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'Admin'
      };
    }
    
    // Return default user profile instead of throwing
    return {
      id: authUser.id,
      email: authUser.email || '',
      role: 'customer' as UserRole,
      name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User'
    };
  }
};
