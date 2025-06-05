
import { User } from '@/types/auth';
import { toast } from 'sonner';

export const navigateBasedOnRole = (navigate: (path: string) => void, userData: User, showToast = true) => {
  try {
    console.log('Navigating user based on role:', userData.role);
    
    switch (userData.role) {
      case 'admin':
        if (showToast) {
          toast.success(`Welcome back, ${userData.name || 'Admin'}!`);
        }
        navigate('/admin-dashboard');
        break;
      case 'customer':
        if (showToast) {
          toast.success(`Welcome back, ${userData.name || 'Customer'}!`);
        }
        navigate('/customer-dashboard');
        break;
      default:
        console.warn('Unknown user role:', userData.role);
        if (showToast) {
          toast.warning('Unknown user role, redirecting to home');
        }
        navigate('/');
    }
  } catch (error) {
    console.error('Navigation error:', error);
    if (showToast) {
      toast.error('Navigation failed, redirecting to home');
    }
    navigate('/');
  }
};

export const getWelcomeMessage = (userData: User): string => {
  const name = userData.name || userData.email.split('@')[0];
  const roleDisplay = userData.role === 'admin' ? 'Administrator' : 'Customer';
  return `Welcome back, ${name}! (${roleDisplay})`;
};

export const validateUserAccess = (userData: User | null, requiredRole?: string): boolean => {
  if (!userData) {
    console.log('User access validation failed: No user data');
    return false;
  }
  
  if (requiredRole && userData.role !== requiredRole) {
    console.log(`User access validation failed: Required ${requiredRole}, got ${userData.role}`);
    return false;
  }
  
  return true;
};
