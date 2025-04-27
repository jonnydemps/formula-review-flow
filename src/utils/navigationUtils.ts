
import { User } from '@/types/auth';

export const navigateBasedOnRole = (navigate: (path: string) => void, userData: User) => {
  switch (userData.role) {
    case 'admin':
      navigate('/admin-dashboard');
      break;
    case 'customer':
      navigate('/customer-dashboard');
      break;
    default:
      navigate('/');
  }
};
