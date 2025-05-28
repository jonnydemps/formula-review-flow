
import { UserRole } from '@/types/auth';

export const isAdminEmail = (email: string): boolean => {
  return email === 'john-dempsey@hotmail.co.uk';
};

export const getDefaultRole = (email: string): UserRole => {
  return isAdminEmail(email) ? 'admin' : 'customer';
};

export const shouldForceAdminRole = (email: string, currentRole: UserRole): boolean => {
  return isAdminEmail(email) && currentRole !== 'admin';
};
