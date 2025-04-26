
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

// Types for our authentication context
export type UserRole = 'customer' | 'specialist';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, role: UserRole, name: string) => Promise<void>;
  signOut: () => void;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock authentication for now - would be replaced with Supabase auth
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Check for existing session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('simplyra_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse stored user', error);
        localStorage.removeItem('simplyra_user');
      }
    }
    setIsLoading(false);
  }, []);

  // Mock sign in function - replace with Supabase auth
  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Mock authentication - this would use Supabase auth.signIn
      if (password.length < 6) {
        throw new Error('Invalid credentials');
      }

      // For demonstration, create a mock user based on email
      const mockUser: User = {
        id: `user-${Date.now()}`,
        email,
        // Determine role based on email (for demo purposes)
        role: email.includes('specialist') ? 'specialist' : 'customer',
        name: email.split('@')[0]
      };

      // Store in local storage for persistence (temporary solution)
      localStorage.setItem('simplyra_user', JSON.stringify(mockUser));
      setUser(mockUser);
      
      toast.success('Successfully signed in');
      
      // Redirect based on role
      if (mockUser.role === 'specialist') {
        navigate('/specialist-dashboard');
      } else {
        navigate('/customer-dashboard');
      }
    } catch (error) {
      console.error('Sign in error:', error);
      toast.error('Failed to sign in');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Mock sign up function - replace with Supabase auth
  const signUp = async (email: string, password: string, role: UserRole, name: string) => {
    setIsLoading(true);
    try {
      // Mock sign up - this would use Supabase auth.signUp
      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }

      // Create mock user
      const mockUser: User = {
        id: `user-${Date.now()}`,
        email,
        role,
        name
      };

      // Store user in local storage
      localStorage.setItem('simplyra_user', JSON.stringify(mockUser));
      setUser(mockUser);
      
      toast.success('Account created successfully');
      
      // Redirect based on role
      if (role === 'specialist') {
        navigate('/specialist-dashboard');
      } else {
        navigate('/customer-dashboard');
      }
    } catch (error) {
      console.error('Sign up error:', error);
      toast.error('Failed to create account');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Sign out function
  const signOut = () => {
    localStorage.removeItem('simplyra_user');
    setUser(null);
    navigate('/');
    toast.success('Signed out successfully');
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
