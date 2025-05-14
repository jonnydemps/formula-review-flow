
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/auth';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole 
}) => {
  const { user, isLoading } = useAuth();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-ra-blue mb-4" />
          <p className="text-gray-500">Verifying access...</p>
        </div>
      </div>
    );
  }

  // If no user is authenticated, redirect to sign-in
  if (!user) {
    console.log('Protected route: No user found, redirecting to sign-in');
    return <Navigate to="/sign-in" replace />;
  }

  // If a specific role is required, check if user has that role
  if (requiredRole && user.role !== requiredRole) {
    console.log(`Protected route: User does not have required role "${requiredRole}", redirecting`);
    // Redirect based on user's actual role
    if (user.role === 'admin') {
      return <Navigate to="/admin-dashboard" replace />;
    }
    return <Navigate to="/customer-dashboard" replace />;
  }

  // User is authenticated and has required role, render the protected component
  return <>{children}</>;
};

export default ProtectedRoute;
