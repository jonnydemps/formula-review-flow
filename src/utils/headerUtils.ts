
import { UserRole } from '@/types/auth';

export const getDashboardLink = (userRole?: UserRole): string => {
  if (!userRole) return '/';
  return userRole === 'admin' ? '/admin-dashboard' : '/customer-dashboard';
};

export const getDashboardLabel = (userRole?: UserRole): string => {
  if (!userRole) return 'Dashboard';
  return userRole === 'admin' ? 'Admin Dashboard' : 'Customer Dashboard';
};
