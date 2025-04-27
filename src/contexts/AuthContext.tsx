import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { User, AuthContextType, UserRole } from '@/types/auth';
import { fetchUserProfile } from '@/services/profileService';
import { navigateBasedOnRole } from '@/utils/navigationUtils';
import { signIn, signUp, signOut } from '@/services/authService';
import { toast } from 'sonner';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Admin email addresses - should match those in profileService.ts
const ADMIN_EMAILS = ['john-dempsey@hotmail.co.uk'];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);
      
      if (event === 'SIGNED_IN' && session?.user) {
        setIsLoading(true);
        try {
          // Check for admin email first - fastest path
          if (ADMIN_EMAILS.includes(session.user.email || '')) {
            const adminUser = {
              id: session.user.id,
              email: session.user.email || '',
              role: 'admin' as UserRole,
              name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'Admin'
            };
            setUser(adminUser);
            navigateBasedOnRole(navigate, adminUser);
            setIsLoading(false);
            return;
          }
          
          // Otherwise, use the standard profile fetch
          const userData = await fetchUserProfile(session.user);
          setUser(userData);
          navigateBasedOnRole(navigate, userData);
        } catch (error) {
          console.error('Error in fetchUserProfile:', error);
          toast.error('Failed to load user profile');
          
          // Try to extract role from user metadata as fallback
          if (session.user.user_metadata?.role) {
            const fallbackUser = {
              id: session.user.id,
              email: session.user.email || '',
              role: session.user.user_metadata.role as UserRole,
              name: session.user.user_metadata.name || session.user.email?.split('@')[0] || 'User'
            };
            
            setUser(fallbackUser);
            navigateBasedOnRole(navigate, fallbackUser);
          } else {
            // Special case for admin emails
            if (ADMIN_EMAILS.includes(session.user.email || '')) {
              const adminUser = {
                id: session.user.id,
                email: session.user.email || '',
                role: 'admin' as UserRole,
                name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'Admin'
              };
              setUser(adminUser);
              navigateBasedOnRole(navigate, adminUser);
              setIsLoading(false);
              return;
            }
            
            await supabase.auth.signOut();
            setUser(null);
          }
        } finally {
          setIsLoading(false);
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        navigate('/');
        setIsLoading(false);
      }
    });

    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setIsLoading(true);
        try {
          // Check for admin email first - fastest path
          if (ADMIN_EMAILS.includes(session.user.email || '')) {
            const adminUser = {
              id: session.user.id,
              email: session.user.email || '',
              role: 'admin' as UserRole,
              name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'Admin'
            };
            setUser(adminUser);
            navigateBasedOnRole(navigate, adminUser);
            setIsLoading(false);
            return;
          }
          
          // Otherwise use standard profile fetch
          const userData = await fetchUserProfile(session.user);
          setUser(userData);
          navigateBasedOnRole(navigate, userData);
        } catch (error) {
          console.error('Error in checkSession:', error);
          
          // Try to extract role from user metadata as fallback
          if (session.user.user_metadata?.role) {
            const fallbackUser = {
              id: session.user.id,
              email: session.user.email || '',
              role: session.user.user_metadata.role as UserRole,
              name: session.user.user_metadata.name || session.user.email?.split('@')[0] || 'User'
            };
            
            setUser(fallbackUser);
            navigateBasedOnRole(navigate, fallbackUser);
          }
          // Special case for admin emails
          else if (ADMIN_EMAILS.includes(session.user.email || '')) {
            const adminUser = {
              id: session.user.id,
              email: session.user.email || '',
              role: 'admin' as UserRole,
              name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'Admin'
            };
            setUser(adminUser);
            navigateBasedOnRole(navigate, adminUser);
          }
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    checkSession();
    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const handleSignIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      await signIn(email, password);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (email: string, password: string, role: UserRole, name: string) => {
    setIsLoading(true);
    try {
      await signUp(email, password, role, name);
      
      // Don't try to auto-sign in after signup - this can cause issues with email confirmation
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error in handleSignOut:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoading, 
      signIn: handleSignIn, 
      signUp: handleSignUp, 
      signOut: handleSignOut 
    }}>
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
