
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
    // Initialize auth listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);
      
      if (event === 'SIGNED_IN' && session?.user) {
        setIsLoading(true);
        try {
          // Admin fast path
          if (ADMIN_EMAILS.includes(session.user.email || '')) {
            console.log('Admin email detected');
            const adminUser = {
              id: session.user.id,
              email: session.user.email || '',
              role: 'admin' as UserRole,
              name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'Admin'
            };
            setUser(adminUser);
            
            // Use setTimeout to prevent auth state deadlocks
            setTimeout(() => {
              navigateBasedOnRole(navigate, adminUser);
              setIsLoading(false);
            }, 0);
            return;
          }
          
          // Standard profile fetch
          const userData = await fetchUserProfile(session.user);
          setUser(userData);
          console.log('User profile fetched:', userData);
          
          // Use setTimeout to prevent auth state deadlocks
          setTimeout(() => {
            navigateBasedOnRole(navigate, userData);
            setIsLoading(false);
          }, 0);
        } catch (error) {
          console.error('Error in fetchUserProfile:', error);
          toast.error('Failed to load user profile');
          
          // Fallback handling
          if (session.user.user_metadata?.role) {
            const fallbackUser = {
              id: session.user.id,
              email: session.user.email || '',
              role: session.user.user_metadata.role as UserRole,
              name: session.user.user_metadata.name || session.user.email?.split('@')[0] || 'User'
            };
            
            setUser(fallbackUser);
            navigateBasedOnRole(navigate, fallbackUser);
          } else if (ADMIN_EMAILS.includes(session.user.email || '')) {
            // Special case for admin emails
            const adminUser = {
              id: session.user.id,
              email: session.user.email || '',
              role: 'admin' as UserRole,
              name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'Admin'
            };
            setUser(adminUser);
            navigateBasedOnRole(navigate, adminUser);
          } else {
            // Default fallback - if all else fails, sign out
            await supabase.auth.signOut();
            setUser(null);
          }
          setIsLoading(false);
        }
      } else if (event === 'SIGNED_OUT') {
        // Fix: Remove the invalid 'USER_DELETED' check since it's not a valid event type
        console.log('User signed out');
        setUser(null);
        navigate('/');
        setIsLoading(false);
      }
    });

    // Check for existing session
    const checkSession = async () => {
      try {
        console.log('Checking for existing session');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session check error:', error);
          setIsLoading(false);
          return;
        }
        
        if (!session) {
          console.log('No active session found');
          setIsLoading(false);
          return;
        }
        
        console.log('Existing session found for user:', session.user.id);
        
        // Admin fast path
        if (ADMIN_EMAILS.includes(session.user.email || '')) {
          console.log('Admin email detected in session check');
          const adminUser = {
            id: session.user.id,
            email: session.user.email || '',
            role: 'admin' as UserRole,
            name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'Admin'
          };
          setUser(adminUser);
          setTimeout(() => {
            navigateBasedOnRole(navigate, adminUser);
            setIsLoading(false);
          }, 0);
          return;
        }
        
        try {
          // Standard profile fetch
          const userData = await fetchUserProfile(session.user);
          setUser(userData);
          setTimeout(() => {
            navigateBasedOnRole(navigate, userData);
            setIsLoading(false);
          }, 0);
        } catch (profileError) {
          console.error('Profile fetch error:', profileError);
          
          // Fallback handling
          if (session.user.user_metadata?.role) {
            const fallbackUser = {
              id: session.user.id,
              email: session.user.email || '',
              role: session.user.user_metadata.role as UserRole,
              name: session.user.user_metadata.name || session.user.email?.split('@')[0] || 'User'
            };
            setUser(fallbackUser);
            navigateBasedOnRole(navigate, fallbackUser);
          } else if (ADMIN_EMAILS.includes(session.user.email || '')) {
            // Admin fallback
            const adminUser = {
              id: session.user.id,
              email: session.user.email || '',
              role: 'admin' as UserRole,
              name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'Admin'
            };
            setUser(adminUser);
            navigateBasedOnRole(navigate, adminUser);
          }
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Session check exception:', error);
        setIsLoading(false);
      }
    };

    // Run session check
    checkSession();

    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const handleSignIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      console.log('Attempting sign in for:', email);
      await signIn(email, password);
    } catch (error) {
      console.error('Sign in handler error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (email: string, password: string, role: UserRole, name: string) => {
    setIsLoading(true);
    try {
      await signUp(email, password, role, name);
      toast.success('Account created successfully! You can now sign in.');
      navigate('/sign-in');
    } catch (error) {
      console.error('Sign up handler error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      console.log('User signing out');
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Sign out handler error:', error);
      // Force clear user state on error
      setUser(null);
      navigate('/');
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
