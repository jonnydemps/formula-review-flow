
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

const Index = () => {
  const { user, isLoading } = useAuth();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-ra-blue mb-4" />
          <p className="text-gray-500">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Once loaded, direct to appropriate route
  if (user) {
    if (user.role === 'admin') {
      return <Navigate to="/admin-dashboard" replace />;
    }
    return <Navigate to="/customer-dashboard" replace />;
  }

  // No authenticated user, go to home page
  return <Navigate to="/" replace />;
};

export default Index;
